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

export const COUNTRIES: CountryData[] = [
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    phoneCode: '+61',
    states: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland'],
      'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
      'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
      'Western Australia': ['Perth', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton'],
      'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta'],
      'Tasmania': ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Ulverstone'],
      'Australian Capital Territory': ['Canberra'],
      'Northern Territory': ['Darwin', 'Alice Springs', 'Palmerston', 'Katherine'],
    },
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    flag: '🇳🇿',
    phoneCode: '+64',
    states: {
      'Auckland': ['Auckland City', 'Manukau', 'Waitakere', 'North Shore', 'Papakura'],
      'Wellington': ['Wellington City', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Kapiti Coast'],
      'Canterbury': ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora', 'Kaiapoi'],
      'Waikato': ['Hamilton', 'Tauranga', 'Rotorua', 'Tokoroa', 'Cambridge'],
      'Bay of Plenty': ['Tauranga', 'Rotorua', 'Whakatane', 'Opotiki'],
      'Otago': ['Dunedin', 'Queenstown', 'Wanaka', 'Oamaru', 'Alexandra'],
      'Northland': ['Whangarei', 'Kerikeri', 'Kaitaia', 'Dargaville'],
      'Manawatu-Wanganui': ['Palmerston North', 'Whanganui', 'Feilding', 'Levin'],
    },
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    flag: '🇱🇰',
    phoneCode: '+94',
    states: {
      'Western Province': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa'],
      'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya', 'Dambulla'],
      'Southern Province': ['Galle', 'Matara', 'Hambantota', 'Tangalle'],
      'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
      'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara'],
      'North Western Province': ['Kurunegala', 'Puttalam', 'Chilaw'],
      'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
      'Uva Province': ['Badulla', 'Monaragala', 'Bandarawela'],
      'Sabaragamuwa Province': ['Ratnapura', 'Kegalle', 'Avissawella'],
    },
  },
];
