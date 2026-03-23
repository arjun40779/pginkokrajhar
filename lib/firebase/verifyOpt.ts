export const verifyOTP = async (confirmation: any, otp: string) => {
  const result = await confirmation.confirm(otp);

  const token = await result.user.getIdToken();

  return token;
};

