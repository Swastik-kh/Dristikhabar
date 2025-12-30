
import React from 'react';
import { APP_NAME } from '../constants';

const AboutUsPage: React.FC = () => {
  // No direct data fetching in this component, so no specific error handling for fetch operations
  // If content were dynamic, similar error state and display would be added.

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh] font-mukta">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-4">
          हाम्रो <span className="text-red-700">बारेमा</span>
        </h1>
        <div className="h-2 w-32 bg-red-700 rounded-full"></div>
        <p className="mt-6 text-slate-500 font-bold text-lg">
          {APP_NAME} सत्य, तथ्य र निष्पक्ष समाचारको संवाहक हो।
        </p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="prose prose-xl max-w-none text-slate-800 leading-[1.8] font-medium selection:bg-red-100">
          <p>
            सन् २०८२ सालमा स्थापित <strong>{APP_NAME}</strong>, नेपाली मिडिया जगतमा विश्वसनीय र जिम्मेवार पत्रकारिताको पर्याय बन्न प्रतिबद्ध छ। हामी निरन्तर राष्ट्रिय तथा अन्तर्राष्ट्रिय घटनाक्रमहरू, राजनीति, समाज, अर्थतन्त्र, खेलकुद, शिक्षा, स्वास्थ्य, प्रविधि र अन्य महत्त्वपूर्ण क्षेत्रका ताजा तथा गहन विश्लेषण सहितका समाचारहरू पाठकमाझ पस्कन्छौं।
          </p>
          <p>
            हाम्रो मुख्य उद्देश्य सूचनाको अधिकार सुनिश्चित गर्नुका साथै समाजमा सकारात्मक परिवर्तनका लागि उत्प्रेरकको भूमिका खेल्नु हो। हामी कुनै पनि प्रकारको पूर्वाग्रह, राजनीतिक वा व्यावसायिक दबाबबाट मुक्त रही स्वतन्त्र र निडर पत्रकारितामा विश्वास राख्छौं। हाम्रो प्रत्येक समाचार सामग्री तथ्यमा आधारित, अनुसन्धान गरिएको र सन्तुलित हुने सुनिश्चित गरिन्छ।
          </p>
          <h2>हाम्रो दृष्टि</h2>
          <p>
            हामी एक यस्तो समाजको परिकल्पना गर्छौं जहाँ प्रत्येक नागरिकलाई सही र पर्याप्त सूचनामा पहुँच होस्, जसले गर्दा उनीहरूले सुसूचित निर्णय लिन सकून्। डिजिटल युगमा गलत सूचनाको बढ्दो जोखिमका बीच, हामी सत्यको खोजीमा दृढ छौं।
          </p>
          <h2>हाम्रो मिशन</h2>
          <ul>
            <li>पाठकहरूलाई सत्य, तथ्यपूर्ण र निष्पक्ष समाचार प्रदान गर्ने।</li>
            <li>जिम्मेवार पत्रकारिताको माध्यमबाट सामाजिक, आर्थिक र राजनीतिक क्षेत्रमा सकारात्मक बहसलाई प्रोत्साहन गर्ने।</li>
            <li>नयाँ प्रविधि र विधिहरू अपनाएर समाचार सम्प्रेषणलाई अझ प्रभावकारी र पहुँचयोग्य बनाउने।</li>
          </ul>
          <p>
            हाम्रो टीम अनुभवी पत्रकार, सम्पादक र प्रविधि विशेषज्ञहरू मिलेर बनेको छ, जो पत्रकारिताको उच्च मापदण्ड कायम राख्न समर्पित छन्। {APP_NAME} परिवारका रूपमा, हामी तपाईंको विश्वास र समर्थनका लागि आभारी छौं।
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;