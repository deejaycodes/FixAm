import { Artisan } from '../models';
import { Op } from 'sequelize';
import type { ServiceType } from './pricing';

const MAX_DISTANCE_KM = 15;

interface Location {
  lat: number;
  lng: number;
}

export function distanceKm(a: Location, b: Location): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function score(artisan: InstanceType<typeof Artisan>, customerLocation: Location): number {
  const dist = artisan.location
    ? distanceKm(customerLocation, artisan.location)
    : MAX_DISTANCE_KM;
  const proxScore = Math.max(0, 1 - dist / MAX_DISTANCE_KM);
  const ratingScore = (artisan.rating || 0) / 5;
  const boost = artisan.priorityBoost ? 0.1 : 0;
  return proxScore * 0.6 + ratingScore * 0.4 + boost;
}

export async function findBestArtisan(serviceType: ServiceType, customerLocation?: Location | null) {
  const artisans = await Artisan.findAll({
    where: {
      services: { [Op.contains]: [serviceType] },
      verified: true,
      available: true,
    },
  });

  if (artisans.length === 0) return null;

  if (!customerLocation) {
    artisans.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return artisans[0];
  }

  const scored = artisans
    .map(a => ({ artisan: a, score: score(a, customerLocation) }))
    .filter(({ artisan }) => {
      if (!artisan.location) return true;
      return distanceKm(customerLocation, artisan.location) <= MAX_DISTANCE_KM;
    })
    .sort((a, b) => b.score - a.score);

  return scored.length > 0 ? scored[0].artisan : null;
}
