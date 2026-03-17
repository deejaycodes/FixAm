import { sendMessage, sendInteractiveList, sendButtons, sendLocation } from './whatsapp';
import { estimatePrice, applyLoyaltyDiscount } from './pricing';
import { findBestArtisan } from './matching';
import { getSession, setSession, deleteSession, Session } from './sessions';
import { transcribeVoiceNote } from './transcription';
import { applyReferralCode } from './referral';
import { isPremium } from './subscription';
import { requestQuotes, submitQuote, getQuotesForRequest, acceptQuote } from './quotes';
import { Customer, Artisan, ServiceRequest, Quote, Message } from '../models';
import { sendPushToCustomer } from './push';
import { fn, col, Op } from 'sequelize';
import type { WhatsAppMessage } from './types';

const SERVICE_MENU = [
  { id: 'plumbing', title: '🔧 Plumbing', description: 'Pipes, taps, drainage' },
  { id: 'electrical', title: '⚡ Electrical', description: 'Wiring, sockets, lights' },
  { id: 'ac_repair', title: '❄️ AC Repair', description: 'Servicing, gas refill, install' },
  { id: 'generator', title: '⚙️ Generator Repair', description: 'Servicing, parts, install' },
  { id: 'carpentry', title: '🪚 Carpentry', description: 'Furniture, doors, cabinets' },
  { id: 'emergency', title: '🚨 Emergency (1.5x)', description: 'Urgent — 1.5x rate' },
];

// ── Main entry point ────────────────────────────────────────────

export async function handleIncoming(from: string, message: WhatsAppMessage): Promise<void> {
  let session = await getSession(from);

  if (session.step === 'start') {
    const existingArtisan = await Artisan.findOne({ where: { whatsappId: from } });
    if (existingArtisan) {
      const text = (message.interactive?.button_reply?.id || message.text?.body || '').toLowerCase().trim();
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

  if (text === 'share location') {
    await artisan.update({ sharingLocation: true });
    await sendMessage(from, '📍 Live location sharing ON. Send your location to update. Customer can track you.');
    return true;
  }
  if (text === 'stop sharing') {
    await artisan.update({ sharingLocation: false, liveLocation: null });
    await sendMessage(from, '📍 Live location sharing OFF.');
    return true;
  }

  // Handle location update for live tracking
  if (!text && message.location && artisan.sharingLocation) {
    await artisan.update({ liveLocation: { lat: message.location.latitude, lng: message.location.longitude } });
    await sendMessage(from, '📍 Location updated.');
    return true;
  }

  if (text === 'profile') {
    const link = `${process.env.BASE_URL || 'http://localhost:3000'}/p/${artisan.profileSlug}`;
    await sendMessage(from, `👤 Your public profile:\n${link}\n\nShare this link with customers!`);
    return true;
  }

  // Handle quote price submission (number only)
  if (/^\d+$/.test(text)) {
    const price = parseInt(text);
    if (price >= 1000 && price <= 500000) {
      const submitted = await submitQuote(artisan.id, price);
      if (submitted) {
        await sendMessage(from, `✅ Quote of ₦${price.toLocaleString()} submitted!`);
        return true;
      }
    }
  }

  if (text === 'help') {
    await sendMessage(from, `👷 Artisan Commands:\n\n"earnings" — view your earnings\n"jobs" — recent job history\n"online" / "offline" — toggle availability\n"accept" / "decline" — respond to job\n"profile" — your shareable profile link\n"share location" / "stop sharing" — GPS tracking\n"help" — show this menu\n\n📸 Send photos during a job\n💰 Reply with a number to submit a quote`);
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

  // Forward artisan text messages to in-app chat
  if (text && !['earnings','jobs','online','offline','profile','help','accept','decline','share location','stop sharing'].includes(text)) {
    const activeJob = await ServiceRequest.findOne({
      where: { ArtisanId: artisan.id, status: { [Op.in]: ['assigned', 'accepted', 'in_progress'] } },
      order: [['createdAt', 'DESC']],
    });
    if (activeJob) {
      await Message.create({ text, sender: 'artisan', ServiceRequestId: activeJob.id });
      await sendMessage(from, '💬 Message sent to customer.');
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
    // Push notification
    if (request.CustomerId) {
      sendPushToCustomer(request.CustomerId, { title: '🚗 Artisan on the way!', body: `${artisan.name} accepted your job and is heading to you.`, url: '/' }).catch(() => {});
    }
    if (customer?.whatsappId) {
      await sendMessage(customer.whatsappId, `🎉 ${artisan.name} has accepted your job and is on the way!\n📞 Contact: ${artisan.phone}\n\nRate 1-5 when the job is done.`);
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
          await sendButtons(from, `Welcome back! 🛠️\n\nBook ${lastJob.Artisan.name} again for ${lastJob.serviceType}?`, [
            { id: 'yes', title: '✅ Same Artisan' },
            { id: 'new', title: '🔄 New Service' },
          ]);
          session.step = 'awaiting_repeat';
          break;
        }
      }
      await sendInteractiveList(from, 'Welcome to FixAm! 🛠️\nWhat service do you need today?\n\n(Artisan? Type "join" to sign up)', 'Choose Service', [{ title: 'Services', rows: SERVICE_MENU }]);
      session.step = 'awaiting_service';
      break;
    }

    case 'awaiting_repeat': {
      const choice = message.interactive?.button_reply?.id || (message.text?.body || '').toLowerCase().trim();
      if (choice === 'yes' && session.lastArtisanId) {
        session.serviceType = session.lastServiceType;
        session.repeatArtisanId = session.lastArtisanId;
        await sendMessage(from, 'Please describe the problem:');
        session.step = 'awaiting_description';
        break;
      }
      // "new" or anything else → show service menu
      await sendInteractiveList(from, 'What service do you need?', 'Choose Service', [{ title: 'Services', rows: SERVICE_MENU }]);
      session.step = 'awaiting_service';
      break;
    }

    case 'awaiting_service': {
      const serviceType = message.interactive?.list_reply?.id || message.text?.body?.toLowerCase();
      const valid = SERVICE_MENU.find(s => s.id === serviceType);
      if (!valid) { await sendMessage(from, 'Please select a service from the list.'); return; }
      if (serviceType === 'emergency') {
        session.emergency = true;
        await sendInteractiveList(from, '🚨 Emergency! What type of service?', 'Select Service', [{
          title: 'Services', rows: SERVICE_MENU.filter(s => s.id !== 'emergency'),
        }]);
        return; // stay on awaiting_service
      }
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

      const priceRange = estimatePrice(session.serviceType as any, session.description, session.emergency);
      let estimate = priceRange ? `₦${priceRange.min.toLocaleString()} – ₦${priceRange.max.toLocaleString()}` : 'TBD';
      if (session.emergency) estimate += ' ⚡ (emergency rate)';

      let customer = await Customer.findOne({ where: { whatsappId: from } });
      if (!customer) {
        customer = await Customer.create({ phone: from, whatsappId: from, location: session.location });
      } else {
        await customer.update({ location: session.location });
      }

      // Loyalty discount for repeat customers
      const completedJobs = await ServiceRequest.count({ where: { CustomerId: customer.id, status: 'completed' } });
      if (priceRange && completedJobs >= 3) {
        priceRange.min = applyLoyaltyDiscount(priceRange.min, completedJobs);
        priceRange.max = applyLoyaltyDiscount(priceRange.max, completedJobs);
        estimate = `₦${priceRange.min.toLocaleString()} – ₦${priceRange.max.toLocaleString()} (5% loyalty discount!)`;
        if (session.emergency) estimate += ' ⚡';
      }

      const request = await ServiceRequest.create({
        serviceType: session.serviceType as any,
        description: session.description,
        location: session.location,
        estimatedPrice: priceRange ? priceRange.min * 100 : undefined,
        CustomerId: customer.id,
      });

      session.requestId = request.id;

      // Premium customers get multi-quote option
      if (isPremium(customer)) {
        const sent = await requestQuotes(request.id, session.serviceType as any, session.location);
        if (sent > 0) {
          await sendMessage(from, `⭐ Premium: We've requested quotes from ${sent} artisans.\nYou'll receive their prices shortly. Reply "quotes" to see them.`);
          session.step = 'awaiting_quotes';
          break;
        }
      }

      // Standard flow: auto-match
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
        const trackingMsg = artisan.sharingLocation && artisan.liveLocation
          ? `\n📍 Live tracking: ${artisan.name} is sharing their location`
          : '';
        await sendButtons(from, `✅ Estimated cost: ${estimate}\n\nWe've found a verified artisan for you:\n👤 ${artisan.name}\n⭐ Rating: ${artisan.rating}/5${trackingMsg}\n\n📞 Phone will be shared once they accept.`, [
          { id: 'confirm', title: '✅ Confirm' },
          { id: 'cancel', title: '❌ Cancel' },
        ]);
        if (artisan.whatsappId) {
          const urgency = session.emergency ? '🚨 EMERGENCY ' : '';
          await sendButtons(artisan.whatsappId, `🔔 ${urgency}New job!\nService: ${session.serviceType}\nProblem: ${session.description}\nEstimate: ${estimate}`, [
            { id: 'accept', title: '✅ Accept' },
            { id: 'decline', title: '❌ Decline' },
          ]);
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

    case 'awaiting_quotes': {
      const text = (message.interactive?.button_reply?.id || message.text?.body || '').toLowerCase().trim();
      if (text === 'quotes') {
        const quotes = await getQuotesForRequest(session.requestId!);
        if (quotes.length === 0) {
          await sendMessage(from, 'No quotes yet — artisans are still responding. Try again in a minute.');
          return;
        }
        const list = quotes.map((q, i) =>
          `${i + 1}. ${q.Artisan?.name} — ₦${(q.price / 100).toLocaleString()} ⭐${q.Artisan?.rating || 0}`
        ).join('\n');
        await sendMessage(from, `💰 Quotes received:\n\n${list}\n\nReply with the number (1, 2, 3) to accept.`);
        return;
      }
      if (['1', '2', '3'].includes(text)) {
        const quotes = await getQuotesForRequest(session.requestId!);
        const idx = parseInt(text) - 1;
        if (quotes[idx]) {
          const accepted = await acceptQuote(quotes[idx].id);
          if (accepted?.Artisan) {
            await sendMessage(from, `✅ You chose ${accepted.Artisan.name} at ₦${(accepted.price / 100).toLocaleString()}!\nThey'll contact you shortly.`);
            if (accepted.Artisan.whatsappId) {
              await sendMessage(accepted.Artisan.whatsappId, `🎉 Your quote was accepted!\nReply "accept" to confirm.`);
            }
          }
          session.step = 'active_job';
          break;
        }
      }
      await sendMessage(from, 'Reply "quotes" to see available quotes, or a number (1-3) to accept one.');
      return;
    }

    case 'awaiting_referral': {
      const btnId = message.interactive?.button_reply?.id;
      const text = (message.interactive?.button_reply?.id || message.text?.body || '').trim().toLowerCase();

      // Any button tap or active_job command → skip referral, go to active_job
      if (btnId || ['cancel', 'confirm', 'track', 'problem', 'guarantee', 'subscribe'].includes(text)) {
        session.step = 'active_job';
        return handleCustomerFlow(from, message, session);
      }

      const raw = (message.text?.body || '').trim();
      if (raw.toLowerCase() !== 'skip') {
        const customer = await Customer.findOne({ where: { whatsappId: from } });
        if (customer) {
          const result = await applyReferralCode(raw.toUpperCase(), customer.id);
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
      const text = (message.interactive?.button_reply?.id || message.text?.body || '').toLowerCase().trim();
      if (text === 'confirm') {
        await sendMessage(from, '✅ Booking confirmed! We\'ll notify you when the artisan accepts.\n\nReply "track" for location, "cancel" to cancel, or rate 1-5 when done.');
        return;
      }
      if (text === 'cancel') {
        const req = await ServiceRequest.findByPk(session.requestId!, { include: [Artisan] });
        if (req?.status === 'accepted' || req?.status === 'in_progress') {
          await sendMessage(from, `The artisan is already on the way. Please contact them directly:\n📞 ${req.Artisan?.phone}\n\nIf there's a problem, reply "problem".`);
          return;
        }
        // Notify artisan if assigned
        if (req?.Artisan?.whatsappId) {
          await sendMessage(req.Artisan.whatsappId, '⚠️ The customer has cancelled this job.');
        }
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
      if (text === 'track') {
        const req = await ServiceRequest.findByPk(session.requestId!, { include: [Artisan] });
        const art = req?.Artisan;
        if (art?.sharingLocation && art.liveLocation) {
          await sendLocation(from, art.liveLocation.lat, art.liveLocation.lng, `📍 ${art.name}`, 'Live location');
        } else {
          await sendMessage(from, 'Artisan is not sharing their location right now.');
        }
        return;
      }
      if (text === 'guarantee') {
        const req = await ServiceRequest.findByPk(session.requestId!);
        if (req && !req.guaranteeUsed && req.status === 'completed') {
          await req.update({ guaranteeUsed: true, status: 'pending', rating: null, completedAt: null });
          await sendMessage(from, '🛡️ Guarantee activated! We\'ll find another artisan to redo the job at no extra cost.');
        } else {
          await sendMessage(from, 'Guarantee is available after job completion if you\'re not satisfied.');
        }
        return;
      }
      if (text === 'subscribe') {
        await sendMessage(from, '⭐ FixAm Premium — ₦5,000/month\n\n• Get quotes from multiple artisans\n• Priority matching\n• Discounted rates\n\nContact admin@fixam.ng to subscribe.');
        return;
      }
      await sendMessage(from, 'Reply "cancel" to cancel, "problem" to report an issue, "track" for artisan location, "guarantee" if not satisfied, or rate 1-5 when complete.');
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
