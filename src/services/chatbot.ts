import { sendMessage, sendInteractiveList } from './whatsapp';
import { estimatePrice } from './pricing';
import { findBestArtisan } from './matching';
import { getSession, setSession, deleteSession, Session } from './sessions';
import { transcribeVoiceNote } from './transcription';
import { applyReferralCode } from './referral';
import { Customer, Artisan, ServiceRequest } from '../models';
import { fn, col, Op } from 'sequelize';
import type { WhatsAppMessage } from './types';

const SERVICE_MENU = [
  { id: 'plumbing', title: '🔧 Plumbing' },
  { id: 'electrical', title: '⚡ Electrical' },
  { id: 'ac_repair', title: '❄️ AC Repair' },
  { id: 'generator', title: '⚙️ Generator Repair' },
  { id: 'carpentry', title: '🪚 Carpentry' },
];

// ── Main entry point ────────────────────────────────────────────

export async function handleIncoming(from: string, message: WhatsAppMessage): Promise<void> {
  let session = await getSession(from);

  if (session.step === 'start') {
    const existingArtisan = await Artisan.findOne({ where: { whatsappId: from } });
    if (existingArtisan) {
      const text = (message.text?.body || '').toLowerCase().trim();
      if (text === 'accept' || text === 'decline') {
        return handleArtisanJobResponse(from, existingArtisan, text);
      }
      const cmd = await handleArtisanCommands(from, existingArtisan, text, message);
      if (cmd) return;
    }
  }

  if (session.role === 'artisan') return handleArtisanFlow(from, message, session);
  if (session.role === 'customer' || session.step !== 'start') return handleCustomerFlow(from, message, session);

  const text = (message.text?.body || '').toLowerCase().trim();
  if (text === 'join' || text === 'artisan') {
    session.role = 'artisan';
    session.step = 'onboard_name';
    await sendMessage(from, 'Welcome to FixAm Artisan signup! 👷\n\nWhat is your full name?');
    await setSession(from, session);
    return;
  }

  session.role = 'customer';
  return handleCustomerFlow(from, message, session);
}

// ── Artisan dashboard commands ──────────────────────────────────

async function handleArtisanCommands(from: string, artisan: InstanceType<typeof Artisan>, text: string, message: WhatsAppMessage): Promise<boolean> {
  if (text === 'earnings') {
    const jobs = await ServiceRequest.findAll({
      where: { ArtisanId: artisan.id, status: 'completed' },
      attributes: [[fn('SUM', col('finalPrice')), 'total'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });
    const row = jobs[0] as any;
    const total = (parseInt(row.total) || 0) / 100;
    const count = parseInt(row.count) || 0;
    await sendMessage(from, `💰 Earnings Summary\n\nTotal jobs: ${count}\nTotal earned: ₦${total.toLocaleString()}\nRating: ⭐ ${artisan.rating}/5`);
    return true;
  }

  if (text === 'jobs') {
    const recent = await ServiceRequest.findAll({
      where: { ArtisanId: artisan.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [Customer],
    });
    if (recent.length === 0) { await sendMessage(from, 'No jobs yet.'); return true; }
    const list = recent.map(r => `• ${r.serviceType} — ${r.status}${r.Customer?.name ? ` (${r.Customer.name})` : ''}`).join('\n');
    await sendMessage(from, `📋 Recent Jobs\n\n${list}`);
    return true;
  }

  if (text === 'online') { await artisan.update({ available: true }); await sendMessage(from, '🟢 You are now online and will receive job requests.'); return true; }
  if (text === 'offline') { await artisan.update({ available: false }); await sendMessage(from, '🔴 You are now offline. No new jobs will be sent.'); return true; }

  if (text === 'help') {
    await sendMessage(from, `👷 Artisan Commands:\n\n"earnings" — view your earnings\n"jobs" — recent job history\n"online" — start receiving jobs\n"offline" — stop receiving jobs\n"accept" / "decline" — respond to job\n"help" — show this menu\n\n📸 Send photos during a job to attach them.`);
    return true;
  }

  if (!text && message.image?.id) {
    const activeJob = await ServiceRequest.findOne({
      where: { ArtisanId: artisan.id, status: { [Op.in]: ['accepted', 'in_progress'] } },
      order: [['createdAt', 'DESC']],
    });
    if (activeJob) {
      const photos = activeJob.photos || [];
      photos.push(message.image.id);
      await activeJob.update({ photos, status: 'in_progress' });
      await sendMessage(from, `📸 Photo saved (${photos.length} total). Send more or wait for customer rating.`);
      return true;
    }
  }

  return false;
}

// ── Artisan job accept/decline ──────────────────────────────────

async function handleArtisanJobResponse(from: string, artisan: InstanceType<typeof Artisan>, response: string): Promise<void> {
  const request = await ServiceRequest.findOne({
    where: { ArtisanId: artisan.id, status: 'assigned' },
    order: [['createdAt', 'DESC']],
  });
  if (!request) { await sendMessage(from, 'No pending job to respond to.'); return; }

  if (response === 'accept') {
    await request.update({ status: 'accepted' });
    await sendMessage(from, '✅ Job accepted! Contact the customer and head over.');
    const customer = await Customer.findByPk(request.CustomerId!);
    if (customer?.whatsappId) {
      await sendMessage(customer.whatsappId, `🎉 ${artisan.name} has accepted your job and is on the way!\nRate 1-5 when the job is done.`);
    }
  } else {
    await request.update({ ArtisanId: null, status: 'pending' });
    await sendMessage(from, 'Job declined. We\'ll find another artisan.');
  }
}

// ── Artisan onboarding flow ─────────────────────────────────────

async function handleArtisanFlow(from: string, message: WhatsAppMessage, session: Session): Promise<void> {
  switch (session.step) {
    case 'onboard_name': {
      session.artisanName = message.text?.body;
      await sendInteractiveList(from, 'What services do you offer? (Pick your main one, you can add more later)', 'Select Service', [{ title: 'Services', rows: SERVICE_MENU }]);
      session.step = 'onboard_service';
      break;
    }
    case 'onboard_service': {
      const svc = message.interactive?.list_reply?.id || message.text?.body?.toLowerCase();
      const valid = SERVICE_MENU.find(s => s.id === svc);
      if (!valid) { await sendMessage(from, 'Please select a service from the list.'); return; }
      session.artisanServices = [svc!];
      await sendMessage(from, '📍 Share your location (this helps us match you with nearby customers)');
      session.step = 'onboard_location';
      break;
    }
    case 'onboard_location': {
      const loc = message.location;
      if (!loc) { await sendMessage(from, 'Please use the attachment button to share your location 📍'); return; }
      const artisan = await Artisan.create({
        name: session.artisanName!,
        phone: from,
        whatsappId: from,
        services: session.artisanServices!,
        location: { lat: loc.latitude, lng: loc.longitude },
      });
      await sendMessage(from, `✅ Welcome aboard, ${artisan.name}! 🎉\n\nYour profile is pending verification. Once verified, you'll start receiving job requests.\n\nReply "accept" or "decline" when you get a job notification.`);
      await deleteSession(from);
      return;
    }
    default:
      session.step = 'onboard_name';
      session.role = 'artisan';
      await sendMessage(from, 'Let\'s start over. What is your full name?');
      break;
  }
  await setSession(from, session);
}

// ── Customer flow ───────────────────────────────────────────────

async function handleCustomerFlow(from: string, message: WhatsAppMessage, session: Session): Promise<void> {
  switch (session.step) {
    case 'start': {
      const customer = await Customer.findOne({ where: { whatsappId: from } });
      if (customer) {
        const lastJob = await ServiceRequest.findOne({
          where: { CustomerId: customer.id, status: 'completed' },
          order: [['completedAt', 'DESC']],
          include: [Artisan],
        });
        if (lastJob?.Artisan) {
          session.lastArtisanId = lastJob.Artisan.id;
          session.lastServiceType = lastJob.serviceType;
          await sendMessage(from, `Welcome back! 🛠️\n\nBook ${lastJob.Artisan.name} again for ${lastJob.serviceType}?\nReply "yes" or choose a new service below.`);
          await sendInteractiveList(from, 'Or pick a different service:', 'New Service', [{ title: 'Services', rows: SERVICE_MENU }]);
          session.step = 'awaiting_repeat';
          break;
        }
      }
      await sendInteractiveList(from, 'Welcome to FixAm! 🛠️\nWhat service do you need today?\n\n(Artisan? Type "join" to sign up)', 'Choose Service', [{ title: 'Services', rows: SERVICE_MENU }]);
      session.step = 'awaiting_service';
      break;
    }

    case 'awaiting_repeat': {
      const text = (message.text?.body || '').toLowerCase().trim();
      if (text === 'yes' && session.lastArtisanId) {
        session.serviceType = session.lastServiceType;
        session.repeatArtisanId = session.lastArtisanId;
        await sendMessage(from, 'Please describe the problem:');
        session.step = 'awaiting_description';
        break;
      }
      session.step = 'awaiting_service';
      return handleCustomerFlow(from, message, session);
    }

    case 'awaiting_service': {
      const serviceType = message.interactive?.list_reply?.id || message.text?.body?.toLowerCase();
      const valid = SERVICE_MENU.find(s => s.id === serviceType);
      if (!valid) { await sendMessage(from, 'Please select a service from the list.'); return; }
      session.serviceType = serviceType!;
      await sendMessage(from, 'Please describe the problem (you can also send a voice note):');
      session.step = 'awaiting_description';
      break;
    }

    case 'awaiting_description': {
      let description = message.text?.body;
      if (!description && message.audio?.id) {
        try {
          description = await transcribeVoiceNote(message.audio.id) ?? undefined;
          if (description) await sendMessage(from, `🎤 Got it: "${description}"`);
        } catch { /* ignore */ }
      }
      session.description = description || '[voice note - transcription unavailable]';
      await sendMessage(from, '📍 Please share your location so we can find artisans near you.');
      session.step = 'awaiting_location';
      break;
    }

    case 'awaiting_location': {
      const loc = message.location;
      if (!loc) { await sendMessage(from, 'Please use the attachment button to share your location 📍'); return; }
      session.location = { lat: loc.latitude, lng: loc.longitude };

      const priceRange = estimatePrice(session.serviceType as any);
      const estimate = priceRange ? `₦${priceRange.min.toLocaleString()} – ₦${priceRange.max.toLocaleString()}` : 'TBD';

      let customer = await Customer.findOne({ where: { whatsappId: from } });
      if (!customer) {
        customer = await Customer.create({ phone: from, whatsappId: from, location: session.location });
      } else {
        await customer.update({ location: session.location });
      }

      const request = await ServiceRequest.create({
        serviceType: session.serviceType as any,
        description: session.description,
        location: session.location,
        estimatedPrice: priceRange ? priceRange.min * 100 : undefined,
        CustomerId: customer.id,
      });

      session.requestId = request.id;

      let artisan: InstanceType<typeof Artisan> | null = null;
      if (session.repeatArtisanId) {
        artisan = await Artisan.findByPk(session.repeatArtisanId);
        if (artisan && !artisan.available) artisan = null;
      }
      if (!artisan) {
        artisan = await findBestArtisan(session.serviceType as any, session.location);
      }

      if (artisan) {
        await request.update({ ArtisanId: artisan.id, status: 'assigned' });
        await sendMessage(from, `✅ Estimated cost: ${estimate}\n\nWe've found a verified artisan for you:\n👤 ${artisan.name}\n⭐ Rating: ${artisan.rating}/5\n📞 ${artisan.phone}\n\nYour referral code: ${customer.referralCode}\nShare it with friends for ₦1,000 off!\n\nReply "cancel" to cancel or "problem" to report an issue.`);
        if (artisan.whatsappId) {
          await sendMessage(artisan.whatsappId, `🔔 New job!\nService: ${session.serviceType}\nProblem: ${session.description}\nEstimate: ${estimate}\n\nReply "accept" or "decline"`);
        }
      } else {
        await sendMessage(from, `✅ Estimated cost: ${estimate}\n\nWe're searching for an available artisan near you. We'll notify you within 30 minutes.`);
      }

      if (!customer.referredBy && !customer.discountUsed) {
        session.step = 'awaiting_referral';
        await sendMessage(from, 'Have a referral code? Send it now for ₦1,000 off, or reply "skip".');
        break;
      }

      session.step = 'active_job';
      break;
    }

    case 'awaiting_referral': {
      const text = (message.text?.body || '').trim();
      if (text.toLowerCase() !== 'skip') {
        const customer = await Customer.findOne({ where: { whatsappId: from } });
        if (customer) {
          const result = await applyReferralCode(text.toUpperCase(), customer.id);
          if (result) {
            const req = await ServiceRequest.findByPk(session.requestId!);
            await req?.update({ discount: result.discount });
            await customer.update({ discountUsed: true });
            await sendMessage(from, `🎉 Referral applied! ₦1,000 discount from ${result.referrerName}.`);
          } else {
            await sendMessage(from, 'Invalid code, but no worries — you can use one next time.');
          }
        }
      }
      session.step = 'active_job';
      break;
    }

    case 'active_job': {
      const text = (message.text?.body || '').toLowerCase().trim();
      if (text === 'cancel') {
        await ServiceRequest.update({ status: 'cancelled' }, { where: { id: session.requestId } });
        await sendMessage(from, 'Your request has been cancelled. Send "Hi" to start again.');
        await deleteSession(from);
        return;
      }
      if (text === 'problem') {
        session.step = 'dispute';
        await sendMessage(from, 'Sorry to hear that. Please describe the issue:');
        break;
      }
      if (['1', '2', '3', '4', '5'].includes(text)) {
        const rating = parseInt(text);
        const req = await ServiceRequest.findByPk(session.requestId!);
        if (req) {
          await req.update({ rating, status: 'completed', completedAt: new Date() });
          if (req.ArtisanId) {
            const stats = await ServiceRequest.findOne({
              where: { ArtisanId: req.ArtisanId, status: 'completed', rating: { [Op.ne]: null } },
              attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'jobCount']],
              raw: true,
            }) as any;
            await Artisan.update(
              { rating: parseFloat(stats?.avgRating) || 0, totalJobs: parseInt(stats?.jobCount) || 0 },
              { where: { id: req.ArtisanId } }
            );
          }
        }
        const customer = await Customer.findOne({ where: { whatsappId: from } });
        await sendMessage(from, `Thank you for your ${text}⭐ rating! See you next time 🙏\n\nShare your code ${customer?.referralCode || ''} with friends for ₦1,000 off!`);
        await deleteSession(from);
        return;
      }
      await sendMessage(from, 'Reply "cancel" to cancel, "problem" to report an issue, or rate 1-5 when complete.');
      break;
    }

    case 'dispute': {
      const review = message.text?.body || '[no details]';
      await ServiceRequest.update({ review }, { where: { id: session.requestId } });
      await sendMessage(from, '⚠️ Issue reported. Our team will review and contact you within 24 hours. Thank you for your patience.');
      session.step = 'active_job';
      break;
    }

    default:
      session.step = 'start';
      session.role = 'customer';
      await handleCustomerFlow(from, message, session);
      return;
  }

  await setSession(from, session);
}
