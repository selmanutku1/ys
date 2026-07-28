import React from 'react';

const questions = [
  { question: "Gölün adı nedir?" },
  { question: "Göl yaklaşık kaç metre derinliğindedir?" },
  { question: "Gölün çevresi yaklaşık kaç metredir?" },
  { question: "Göl doğal mı yoksa yapay mı?" },
  { question: "Gölün etrafını yürümek yaklaşık kaç dakika sürer?" },
  { question: "Gölde hangi canlı türlerini görebilirsiniz?" },
  { question: "Gölde balık var mı?" },
  { question: "Gölün suyu hangi kaynaktan beslenmektedir?" },
  { question: "Göl kenarında güvenlik amacıyla bulunan ekipmanlardan biri nedir?" },
  { question: "Göl çevresinde kaç adet oturma bankı bulunmaktadır?" },
  { question: "Gün batımını izlemek için en uygun nokta neresidir?" },
  { question: "Göl çevresindeki yürüyüş yolu hangi malzemeden yapılmıştır?" },
  { question: "Kamp alanında en çok hangi ağaç türü bulunmaktadır?" },
  { question: "Kaç farklı ağaç türü görebildiniz?" },
  { question: "Ormanda duyduğunuz üç farklı kuş sesi sayınız." },
  { question: "Kamp Alanındaki En yaşlı ağaç kaç yaşındadır?." },
  { question: "Kamp alanında kaç farklı kuş gözlemlediniz?" },
  { question: "Ormanda hangi renkler daha baskındır?" },
  { question: "Ağaçların gövdelerinde yosun var mı?" },
  { question: "Kamp alanında kaç farklı spor sahası bulunmaktadır?" },
  { question: "Basketbol potası kaç tanedir?" },
  { question: "Futbol sahası doğal çim mi, sentetik çim mi?" },
  { question: "Kamp alanında tenis kortu var mı?" },
  { question: "Kamp alanında hangi spor branşları yapılabilir?" },
  { question: "Spor sahalarının yanında dinlenme alanı var mı?" },
  { question: "Kamp alanındaki en büyük spor sahası hangisidir?" },
  { question: "Kamp alanında toplam kaç bungalov bulunmaktadır?" },
  { question: "Bir bungalovda en fazla kaç kişi konaklayabilir?" },
  { question: "Bungalovların dış cephesi hangi renktedir?" },
  { question: "Yürüyüş parkuru yaklaşık kaç metredir?" },
  { question: "Parkuru yürümek ortalama kaç dakika sürmektedir?" },
  { question: "Parkur üzerinde kaç adet yönlendirme tabelası bulunmaktadır?" },
  { question: "Parkurun en yüksek noktası neresidir?" },
  { question: "Parkur boyunca kaç adet dinlenme bankı bulunmaktadır?" },
  { question: "Parkur üzerinde kaç farklı kuş sesi duydunuz?" },
  { question: "Parkur boyunca kaç farklı çiçek türü gözlemlediniz?" }
];

const KahootQuestionPoolView = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-emerald-900 mb-6 text-center">Yeşilay Yaylagöl Kamp Merkezi Mini Oyunlaştırma Soru Havuzu</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {questions.map((q, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
            <span className="text-emerald-600 font-bold mr-2">{index + 1}.</span>
            <span className="text-gray-800">{q.question}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KahootQuestionPoolView;
