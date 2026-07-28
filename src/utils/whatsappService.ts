export const sendWhatsAppNotification = async (phone: string, message: string): Promise<boolean> => {
  console.log(`[WhatsApp API Mock] Gönderilen Numara: ${phone} | Mesaj: ${message}`);
  
  // Burada gerçek bir WhatsApp Business API (örn: Twilio, Meta Graph API, 360Dialog) çağrısı yapılır.
  // fetch('https://api.whatsapp.com/send...', { ... })
  
  // Simüle edilmiş bir bekleme süresi
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return true;
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  // Telefon numarasını temizle (sadece rakamlar)
  const cleanPhone = phone.replace(/\D/g, '');
  // WhatsApp yönlendirme linki oluştur
  return `https://wa.me/90${cleanPhone}?text=${encodeURIComponent(message)}`;
};
