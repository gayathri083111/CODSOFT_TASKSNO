import React from 'react';
import { UtensilsCrossed, Github, Linkedin, Heart, Shield, Clock, Award, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-serif">
                Dine<span className="text-amber-500">Desk</span>
              </span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">
              "Delicious food. Delivered with ease."
              <br />
              A full-stack restaurant ordering platform with real-time order tracking, culinary distinction, and intuitive admin operations.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/gayathri083111"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-colors text-stone-300"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/gayathri-gorli-83b394326/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-colors text-stone-300"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Menu Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Cuisine Categories
            </h3>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Hyderabadi & Dum Biryani
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Tandoori & Desi Starters
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Makhani & Traditional Curries
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Fresh Clay Oven Naan & Roti
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Wok Fried Rice & Noodles
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer transition-colors">
                  Gulab Jamun & Desserts
                </span>
              </li>
            </ul>
          </div>

          {/* Service Promises */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Our Food Promise
            </h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>30-Min Fast Express Delivery guaranteed right to your doorstep.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Fresh authentic ingredients and 100% segregated Veg & Non-Veg kitchens.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Hygienic tamper-evident thermal safety packaging.</span>
              </li>
            </ul>
          </div>

          {/* Project & Internship Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Internship Task Details
            </h3>
            <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/60 text-xs space-y-2 text-stone-300">
              <p className="font-semibold text-amber-400">CodSoft Internship Task 2</p>
              <p>Full-Stack Web Development</p>
              <p>
                Developer:{' '}
                <span className="text-white font-bold">Gorli Gayathri</span>
              </p>
              <div className="pt-2 border-t border-stone-700 text-[11px] text-stone-300">
                <p className="font-bold text-stone-200">Demo Accounts:</p>
                <p>Admin: admin@dinedesk.com</p>
                <p>Customer: customer@dinedesk.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} DineDesk. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by Gorli Gayathri for CodSoft</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
