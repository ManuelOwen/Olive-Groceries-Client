import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import bg from "@/images/family-father-mother-daughter-grocery-shopping-supermarket_iStock-1436468416.jpg"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  const slideInLeft = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const slideInRight = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const bounceIn = {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.6,
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content Layer */}
      <div className="relative z-10 text-white flex flex-col min-h-screen">
        
        {/* Hero Section */}
        <motion.section 
          className="flex-grow flex flex-col justify-center items-center text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold italic text-purple-200 drop-shadow mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We Grow, Store And Deliver To Your Door Step
          </motion.h2>
          <motion.p 
            className="text-2xl md:text-3xl font-bold italic text-pink-300 drop-shadow mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Enjoy The Best Fresh Groceries
          </motion.p>

          <motion.div 
            className="bg-opacity-90 p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button 
              className="bg-white text-orange-500 px-6 py-3 rounded font-semibold italic hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signin">Create an Account</Link>
            </motion.button>
            <motion.button 
              className="bg-white text-orange-500 px-8 py-3 rounded font-semibold italic hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/products">Proceed To order with us</Link>
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-16 px-4"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-6xl mx-auto">
            <motion.h3 
              className="text-3xl font-bold text-center mb-12 text-white"
              variants={fadeInUp}
            >
              Our Features
            </motion.h3>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                variants={scaleIn}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🛒
                </motion.div>
                <h4 className="text-xl font-semibold mb-3">Easy Online Ordering</h4>
                <p className="text-white/90">Browse our extensive catalog of fresh groceries and place orders with just a few clicks. Our user-friendly interface makes shopping effortless.</p>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                variants={scaleIn}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🚚
                </motion.div>
                <h4 className="text-xl font-semibold mb-3">Fast Delivery</h4>
                <p className="text-white/90">Get your groceries delivered to your doorstep within hours. Our reliable delivery network ensures timely and safe delivery.</p>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                variants={scaleIn}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🌱
                </motion.div>
                <h4 className="text-xl font-semibold mb-3">Fresh & Quality</h4>
                <p className="text-white/90">We source only the freshest and highest quality products directly from local farmers and trusted suppliers.</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Services Section */}
        <motion.section 
          className="py-16 px-4 bg-black/30"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-6xl mx-auto">
            <motion.h3 
              className="text-3xl font-bold text-center mb-12 text-white"
              variants={fadeInUp}
            >
              Our Services
            </motion.h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🍎", title: "Fresh Fruits", desc: "Seasonal and exotic fruits delivered fresh daily" },
                { icon: "🥬", title: "Fresh Vegetables", desc: "Organic and locally sourced vegetables" },
                { icon: "🥩", title: "Quality Meat", desc: "Premium cuts of meat and poultry" },
                { icon: "🥛", title: "Dairy Products", desc: "Fresh dairy and dairy alternatives" }
              ].map((service, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                  variants={bounceIn}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                >
                  <motion.div 
                    className="text-3xl mb-3"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {service.icon}
                  </motion.div>
                  <h4 className="text-lg font-semibold mb-2">{service.title}</h4>
                  <p className="text-sm text-white/90">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          className="py-16 px-4"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-6xl mx-auto">
            <motion.h3 
              className="text-3xl font-bold text-center mb-12 text-white"
              variants={fadeInUp}
            >
              How It Works
            </motion.h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Sign Up", desc: "Create your account in minutes" },
                { step: "2", title: "Browse & Order", desc: "Select your favorite groceries" },
                { step: "3", title: "Payment", desc: "Secure payment with Paystack" },
                { step: "4", title: "Delivery", desc: "Get delivered to your doorstep" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  variants={slideInLeft}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.step}
                  </motion.div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-white/90">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="py-16 px-4 bg-black/30"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-6xl mx-auto">
            <motion.h3 
              className="text-3xl font-bold text-center mb-12 text-white"
              variants={fadeInUp}
            >
              What Our Customers Say
            </motion.h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  rating: "★★★★★", 
                  text: "Amazing service! The groceries are always fresh and delivery is super fast. Highly recommended!", 
                  author: "Sarah M." 
                },
                { 
                  rating: "★★★★★", 
                  text: "The best online grocery store I've used. Quality products and excellent customer service.", 
                  author: "John D." 
                },
                { 
                  rating: "★★★★★", 
                  text: "Convenient, reliable, and the prices are great. Olive Groceries has become my go-to for all my grocery needs.", 
                  author: "Mary K." 
                }
              ].map((testimonial, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  variants={slideInRight}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <motion.div 
                    className="flex items-center mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <motion.div 
                      className="text-yellow-400 text-xl"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {testimonial.rating}
                    </motion.div>
                  </motion.div>
                  <p className="text-white/90 mb-4">{testimonial.text}</p>
                  <div className="font-semibold">- {testimonial.author}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          className="py-16 px-4"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-6xl mx-auto">
            <motion.h3 
              className="text-3xl font-bold text-center mb-12 text-white"
              variants={fadeInUp}
            >
              Why Choose Olive Groceries?
            </motion.h3>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                variants={slideInLeft}
                whileHover={{ x: 10, scale: 1.02 }}
              >
                <h4 className="text-xl font-semibold mb-4 text-orange-400">Quality Assurance</h4>
                <ul className="space-y-2 text-white/90">
                  {[
                    "Fresh products sourced from local farmers",
                    "Quality control at every step",
                    "Organic and natural options available",
                    "Strict food safety standards"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      • {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                variants={slideInRight}
                whileHover={{ x: -10, scale: 1.02 }}
              >
                <h4 className="text-xl font-semibold mb-4 text-orange-400">Convenience</h4>
                <ul className="space-y-2 text-white/90">
                  {[
                    "24/7 online ordering",
                    "Fast delivery within hours",
                    "Real-time order tracking",
                    "Multiple payment options"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      • {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section 
          className="py-16 px-4 bg-orange-600/20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-4xl mx-auto text-center">
            <motion.h3 
              className="text-3xl font-bold mb-6 text-white"
              variants={fadeInUp}
            >
              Ready to Get Started?
            </motion.h3>
            <motion.p 
              className="text-xl mb-8 text-white/90"
              variants={fadeInUp}
            >
              Join thousands of satisfied customers who trust Olive Groceries for their daily needs.
            </motion.p>
            <motion.div 
              className="flex flex-col md:flex-row gap-4 justify-center"
              variants={scaleIn}
            >
              <motion.button 
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signin">Start Shopping Now</Link>
              </motion.button>
              <motion.button 
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/products">Browse Products</Link>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center py-12 mt-auto text-sm text-white bg-black/40"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {[
                {
                  title: "Contact Info",
                  items: ["Info@Olivegroceries.com", "+254712345678", "Nairobi, Kenya"]
                },
                {
                  title: "Quick Links",
                  items: [
                    { text: "Products", link: "/products" },
                    { text: "About Us", link: "/about" },
                    { text: "Contact", link: "/contact" }
                  ]
                },
                {
                  title: "Services",
                  items: ["Fresh Groceries", "Fast Delivery", "Quality Assurance"]
                },
                {
                  title: "Support",
                  items: ["Customer Service", "Order Tracking", "Returns & Refunds"]
                }
              ].map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-semibold mb-3">{section.title}</h4>
                  {section.items.map((item, itemIndex) => (
                    <motion.p 
                      key={itemIndex}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {typeof item === 'string' ? (
                        item
                      ) : (
                        <Link to={item.link} className="hover:text-orange-400">
                          {item.text}
                        </Link>
                      )}
                    </motion.p>
                  ))}
                </motion.div>
              ))}
            </div>
            <motion.div 
              className="border-t border-white/20 pt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="italic mb-1">Safe and Efficient Way to get your Groceries</p>
              <p>&copy; 2024 Olive Groceries. All rights reserved.</p>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
