import React from 'react';
import { DuzceMenu, OzelMenu } from '../menuData';
import { BookOpenText, ChefHat, Users } from 'lucide-react';

export default function ReferansMenulerView() {
  return (
    <div className="space-y-8 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpenText className="w-5 h-5 text-emerald-600" />
          Düzce Kampı Örnek Menü Tablosu
        </h3>
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-emerald-50 text-emerald-900 font-bold uppercase">
              <tr>
                <th className="p-3">Gün</th>
                <th className="p-3">Çorbalar</th>
                <th className="p-3">Ana Yemekler</th>
                <th className="p-3">Yardımcı Yemekler</th>
                <th className="p-3">Tatlı/Meyve</th>
                <th className="p-3">Salata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DuzceMenu.map((menu, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-bold">{menu.day}</td>
                  <td className="p-3">{menu.corbalar}</td>
                  <td className="p-3">{menu.anaYemekler}</td>
                  <td className="p-3">{menu.yardimciYemekler}</td>
                  <td className="p-3">{menu.tatliMeyve}</td>
                  <td className="p-3">{menu.salatabar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          Özel Açık Büfe Seçenekleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OzelMenu.map((menu, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <h4 className="font-bold text-emerald-800 text-sm">{menu.section}</h4>
              <div className="space-y-2 text-xs">
                <p><strong>Zeytinyağlılar:</strong> {menu.zeytinyagli.join(', ')}</p>
                <p><strong>Tatlılar:</strong> {menu.tatli.join(', ')}</p>
                <p><strong>Meyveler:</strong> {menu.meyve.join(', ')}</p>
                <p><strong>Yemekler:</strong> {menu.yemek.join(', ')}</p>
                <p><strong>İçecekler:</strong> {menu.icecek.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
