
import React from 'react';
import { APP_NAME } from '../constants';

const ContactUsPage: React.FC = () => {
  // No direct data fetching in this component, so no specific error handling for fetch operations
  // If contact details were dynamic, similar error state and display would be added.

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh] font-mukta">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-4">
          हामीलाई <span className="text-red-700">सम्पर्क गर्नुहोस्</span>
        </h1>
        <div className="h-2 w-32 bg-red-700 rounded-full"></div>
        <p className="mt-6 text-slate-500 font-bold text-lg">
          तपाईंका प्रश्न, सुझाव वा प्रतिक्रियाका लागि हामी सधैं तत्पर छौं।
        </p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="prose prose-xl max-w-none text-slate-800 leading-[1.8] font-medium selection:bg-red-100">
          <p>
            {APP_NAME} सँग सम्पर्कमा रहनका लागि निम्न जानकारी प्रयोग गर्नुहोस्। हामी तपाईंको सन्देशलाई सकेसम्म चाँडो जवाफ दिनेछौं।
          </p>

          <h2>हाम्रो कार्यालय</h2>
          <p>
            <strong>ठेगाना:</strong> काठमाडौं, नेपाल <br/>
            <strong>इमेल:</strong> <a href="mailto:info@dristikhabar.com" className="text-blue-600 hover:underline">info@dristikhabar.com</a>
          </p>

          <h2>कार्यालय समय</h2>
          <p>
            आइतबार - शुक्रबार: बिहान ९:०० बजे देखि साँझ ५:०० बजे सम्म <br/>
            शनिबार: बन्द
          </p>

          <h2>सामाजिक सञ्जालमा हामीलाई पछ्याउनुहोस्</h2>
          <p>
            नवीनतम समाचार र अपडेटहरूका लागि हाम्रो सामाजिक सञ्जाल पृष्ठहरूमा हामीलाई पछ्याउनुहोस्।
            <br/>
            <a href="https://www.facebook.com/dristikhabar" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">फेसबुक</a> | 
            <a href="https://twitter.com/dristikhabar" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ट्वीटर (X)</a> | 
            <a href="https://www.youtube.com/dristikhabar" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">युट्यूब</a>
          </p>

          <h3>प्रतिक्रिया फारम (छिट्टै आउँदैछ)</h3>
          <p>
            तपाईंको सुविधाका लागि, हामी छिट्टै यहाँ एक अनलाइन प्रतिक्रिया फारम उपलब्ध गराउनेछौं। तबसम्म, कृपया माथि उल्लिखित सम्पर्क विवरणहरू प्रयोग गर्नुहोस्।
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;