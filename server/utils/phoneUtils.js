import pkg from 'google-libphonenumber';        
const { PhoneNumberUtil, PhoneNumberFormat } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();

export const formatIndianPhoneNumber = (phoneNumber) => {
  try {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle numbers with or without country code
    const number = cleaned.startsWith('91') 
      ? phoneUtil.parse(cleaned, 'IN')
      : phoneUtil.parse(`91${cleaned}`, 'IN');

    if (!phoneUtil.isValidNumberForRegion(number, 'IN')) {
      throw new Error('Invalid Indian phone number');
    }

    return phoneUtil.format(number, PhoneNumberFormat.E164);
  } catch (error) {
    throw new Error('Invalid phone number format');
  }
};

export const isValidIndianPhoneNumber = (phoneNumber) => {
  try {
    const number = phoneUtil.parse(phoneNumber, 'IN');
    return phoneUtil.isValidNumberForRegion(number, 'IN');
  } catch (error) {
    return false;
  }
};