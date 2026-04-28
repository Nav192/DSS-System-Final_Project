export interface RestaurantBase {
  name: string;
  harga: number;
  rasa: number;
  kebersihan: number;
  kenyamanan: number;
  pelayanan: number;
  fasilitas: number;
  popularitas: number;
}

export interface RestaurantCreate extends RestaurantBase {}

export interface Restaurant extends RestaurantBase {
  id: string;
}

export interface RankedRestaurant extends Restaurant {
  score: number;
  rank: number;
}
