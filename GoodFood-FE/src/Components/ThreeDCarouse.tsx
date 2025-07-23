import React, { useState, useEffect } from "react";
import "../assets/css/ThreeDCarousel.css";
import { Products } from "../Interfaces/Products";

type ThreeDCarouselDProps = {
  products: Products[];
};

const ThreeDCarousel: React.FC<ThreeDCarouselDProps> = ({ products }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemCount = products.length;
  const rotateStep = 360 / itemCount;
  const translateZ = 400;

  const rotateCarousel = (direction: "next" | "prev") => {
    setSelectedIndex((prev) =>
      direction === "next"
        ? (prev + 1) % itemCount
        : (prev - 1 + itemCount) % itemCount
    );
  };

  const handleClick = (item: Products) => {
    console.log(item.productName);
  };

  // Auto rotate every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      rotateCarousel("next");
    }, 3000); // chỉnh thời gian tại đây (milliseconds)

    return () => clearInterval(interval); // cleanup khi component unmount
  }, [itemCount]); // chỉ khởi tạo 1 lần hoặc khi số sản phẩm thay đổi

  return (
    <div className="carousel-wrapper">
      <div className="carousel" style={{ transform: `translateZ(-${translateZ}px)` }}>
        {products.map((item, i) => {
          const rotation = (i - selectedIndex) * rotateStep;
          return (
            <div
              key={i}
              className="carousel__cell"
              style={{
                transform: `rotateY(${rotation}deg) translateZ(${translateZ}px)`
              }}
              onClick={() => handleClick(item)}
            >
              <img src={item.coverImage} alt={item.productName} />
              <div className="carousel__info">
                <h3>{item.productName}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreeDCarousel;
