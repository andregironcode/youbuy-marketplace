import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ProductType } from "@/types/product";
import { Card } from "@/components/ui/card";

interface HeroAnimationProps {
  products: ProductType[];
}

export const HeroAnimation = ({ products }: HeroAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity }}
      className="absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      {/* 3D Grid */}
      <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {products.slice(0, 12).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              transition: {
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }
            }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
              transition: { duration: 0.5 }
            }}
            className="relative aspect-square"
          >
            <Card className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              {product.image_urls?.[0] && (
                <img
                  src={product.image_urls[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium truncate">
                  {product.title}
                </p>
                <p className="text-primary text-sm font-bold">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-primary/20 rounded-full blur-xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-primary/20 rounded-full blur-xl"
      />
    </motion.div>
  );
}; 