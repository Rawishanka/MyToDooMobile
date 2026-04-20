// Types and interfaces for signup flow

export type VerificationStep = 'email' | 'sms' | null;

export interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CountryData {
  name: string;
  code: string;
  flag: string;
  phoneCode: string;
  states: { [key: string]: string[] };
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: Date | null;
  selectedCountry: CountryData;
  selectedLocation: LocationData | null;
}

export interface OTPState {
  emailOtp: string[];
  smsOtp: string[];
  emailVerified: boolean;
  smsVerified: boolean;
  emailTimer: number;
  smsTimer: number;
}

// Australia-only app - Single country configuration
export const COUNTRIES: CountryData[] = [
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    phoneCode: '+61',
    states: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland', 'Gosford', 'Parramatta', 'Penrith', 'Liverpool', 'Campbelltown', 'Blacktown', 'Hurstville', 'Bankstown', 'Fairfield', 'Sutherland', 'Hornsby', 'Chatswood', 'Bondi', 'Manly', 'Cronulla'],
      'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Mildura', 'Warrnambool', 'Traralgon', 'Wodonga', 'Dandenong', 'Frankston', 'Ringwood', 'Box Hill', 'Glen Waverley', 'St Kilda', 'South Yarra', 'Richmond', 'Brunswick', 'Footscray', 'Werribee'],
      'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Mackay', 'Rockhampton', 'Bundaberg', 'Hervey Bay', 'Gladstone', 'Ipswich', 'Logan', 'Redcliffe', 'Caboolture', 'Caloundra', 'Noosa', 'Surfers Paradise', 'Broadbeach', 'Southport'],
      'Western Australia': ['Perth', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton', 'Albany', 'Rockingham', 'Fremantle', 'Joondalup', 'Midland', 'Armadale', 'Kalamunda', 'Scarborough', 'Cottesloe', 'Subiaco', 'Claremont', 'Nedlands', 'Victoria Park', 'South Perth', 'Cannington'],
      'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta', 'Port Lincoln', 'Victor Harbor', 'Port Pirie', 'Gawler', 'Salisbury', 'Elizabeth', 'Tea Tree Gully', 'Modbury', 'Marion', 'Brighton', 'Glenelg', 'Norwood', 'Unley', 'Prospect', 'Mitcham'],
      'Tasmania': ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Ulverstone', 'Kingston', 'Sandy Bay', 'Glenorchy', 'Clarence', 'New Town', 'Moonah', 'Bellerive', 'Lindisfarne', 'Howrah', 'Sorell', 'Brighton', 'Bridgewater', 'Claremont', 'Rosny', 'Mornington'],
      'Australian Capital Territory': ['Canberra', 'Belconnen', 'Woden', 'Tuggeranong', 'Gungahlin', 'Civic', 'Braddon', 'Kingston', 'Manuka', 'Dickson', 'Fyshwick', 'Mitchell', 'Queanbeyan'],
      'Northern Territory': ['Darwin', 'Alice Springs', 'Palmerston', 'Katherine', 'Casuarina', 'Nightcliff', 'Fannie Bay', 'Stuart Park', 'The Gardens', 'Parap', 'Winnellie', 'Berrimah'],
    },
  },
];

// Helper: Get Australia as the default and only country
export const AUSTRALIA = COUNTRIES[0];
