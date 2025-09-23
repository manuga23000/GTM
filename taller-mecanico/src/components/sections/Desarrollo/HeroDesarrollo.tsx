import React from 'react';
import { FaCalendarCheck, FaCarSide, FaBell, FaMobileAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function HeroDesarrollo() {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center py-20 min-h-[70vh]"
      style={{
        backgroundImage: "url('/images/home/cajaautomatica.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'grayscale(0.3) brightness(0.85)'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />
      <div className="relative z-10 max-w-3xl w-full mx-auto p-8 rounded-xl shadow-2xl bg-white/95 flex flex-col items-center border-2 border-red-600">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center text-red-700 drop-shadow-lg uppercase tracking-wide">
          Desarrollo para Talleres
        </h1>
        <p className="mb-8 text-lg md:text-xl text-gray-900 text-center font-medium">
          En <span className="font-bold text-red-700">GTM</span> nos especializamos en el desarrollo de páginas web para talleres mecánicos y de servicios automotrices. Nuestro objetivo es que otros talleres puedan contar con el mismo sistema de <span className="font-bold text-red-700">turnos online</span> y <span className="font-bold text-red-700">seguimiento de vehículos</span> que usamos en nuestra propia gestión.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 w-full">
          <div className="flex items-center gap-4 bg-red-50 rounded-lg p-4 shadow border border-red-200">
            <FaCalendarCheck className="text-2xl text-red-600" />
            <span className="text-black font-semibold">Solicitá turnos online fácil y rápido</span>
          </div>
          <div className="flex items-center gap-4 bg-red-50 rounded-lg p-4 shadow border border-red-200">
            <FaCarSide className="text-2xl text-red-600" />
            <span className="text-black font-semibold">Seguimiento transparente de cada vehículo</span>
          </div>
          <div className="flex items-center gap-4 bg-red-50 rounded-lg p-4 shadow border border-red-200">
            <FaBell className="text-2xl text-red-600" />
            <span className="text-black font-semibold">Notificaciones automáticas a tus clientes</span>
          </div>
          <div className="flex items-center gap-4 bg-red-50 rounded-lg p-4 shadow border border-red-200">
            <FaMobileAlt className="text-2xl text-red-600" />
            <span className="text-black font-semibold">Interfaz moderna y adaptada a móviles</span>
          </div>
        </div>
        <Link href="/contacto">
          <button className="bg-gradient-to-r from-red-700 to-black hover:from-black hover:to-red-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 hover:scale-105 border-2 border-red-700">
            ¡Quiero mi sistema!
          </button>
        </Link>
        <p className="text-md text-black text-center mt-6">
          Si tenés un taller y querés digitalizar tu gestión, <span className="font-bold text-red-700">contactanos</span> para que tu negocio también cuente con un sistema profesional y eficiente como el nuestro.
        </p>
      </div>
    </section>
  );
}

