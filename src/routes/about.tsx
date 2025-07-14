import { motion } from 'framer-motion';
import bg from '@/images/bg.jpeg';
import family from '@/images/family-father-mother-daughter-grocery-shopping-supermarket_iStock-1436468416.jpg';
import apples from '@/images/apples.jpg';
import basket from '@/images/basket.jpg';
import carrots from '@/images/carrots.jpg';
import grapes from '@/images/Grape.webp';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden">
        <motion.img
          src={bg}
          alt="Groceries background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <motion.div
          className="relative z-20 text-center text-white px-4"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold italic mb-4 drop-shadow-lg">About Olive Groceries</h1>
          <p className="text-lg md:text-2xl font-semibold italic text-orange-200 mb-6 drop-shadow">
            Freshness Delivered. Community Grown. Your Trusted Grocery Partner.
          </p>
        </motion.div>
      </div>

      {/* Mission & Story */}
      <section className="max-w-4xl mx-auto py-12 px-4 text-center">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-orange-600 mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Our Mission
        </motion.h2>
        <motion.p
          className="text-gray-700 text-lg mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          At Olive Groceries, we are dedicated to bringing the freshest, healthiest, and most delicious groceries straight from local farms to your doorstep. Our mission is to make healthy living accessible, convenient, and affordable for every family.
        </motion.p>
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.img
            src={family}
            alt="Family shopping"
            className="rounded-xl shadow-lg w-full md:w-80 h-56 object-cover object-center"
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, type: 'spring' }}
          />
          <motion.div
            className="text-left max-w-md"
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          >
            <h3 className="text-xl font-semibold text-green-700 mb-2">Our Story</h3>
            <p className="text-gray-600">
              Founded with a passion for quality and community, Olive Groceries partners with local farmers and trusted suppliers to ensure every product meets our high standards. We believe in supporting local agriculture, reducing food miles, and delivering only the best to your table.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Image Grid */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-orange-600 mb-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          The Freshest Selection
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[apples, basket, carrots, grapes].map((img, i) => (
            <motion.div
              key={i}
              className="rounded-xl overflow-hidden shadow-lg bg-white"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, type: 'spring' }}
            >
              <img src={img} alt="Fresh produce" className="w-full h-40 object-cover object-center" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-3xl mx-auto py-12 px-4 text-center">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-orange-600 mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Why Choose Olive Groceries?
        </motion.h2>
        <motion.ul
          className="space-y-4 text-lg text-gray-700"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            'Wide selection of fresh, local produce',
            'Fast and reliable doorstep delivery',
            'Affordable prices and great deals',
            'Sustainable and community-focused',
            'Easy and secure online ordering',
          ].map((reason, i) => (
            <motion.li
              key={reason}
              className="flex items-center gap-3 justify-center"
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="w-3 h-3 bg-orange-400 rounded-full inline-block" />
              {reason}
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-auto">
        <p className="italic mb-1">Safe and Efficient Way to get your Groceries</p>
        <p>Info@Olivegroceries.com</p>
        <p>+254712345678</p>
      </footer>
    </div>
  );
}
