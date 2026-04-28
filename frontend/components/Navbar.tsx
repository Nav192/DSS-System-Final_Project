'use client';

import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

const Navbar = () => {
  const { currentStep, setCurrentStep } = useAppContext();

  const steps = [
    { id: 1, name: 'Hitung Bobot (AHP)', path: '/' },
    { id: 2, name: 'Input Data (Restoran)', path: '/restaurants' },
    { id: 3, name: 'Hasil Ranking (MOORA)', path: '/ranking' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-extrabold tracking-wide">DSS AHP-MOORA</h1>
        <div className="flex space-x-2 md:space-x-4">
          {steps.map((step) => (
            <Link key={step.id} href={step.path} passHref>
              <span
                onClick={() => setCurrentStep(step.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer
                  ${currentStep === step.id
                    ? 'bg-white text-blue-800 shadow-md'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'}
                `}
              >
                {step.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
