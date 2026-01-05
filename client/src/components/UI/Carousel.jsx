import { useMemo, useState } from 'react';
import './ui.css';

export default function Carousel({ itemsPerView = 3, children }) {
  const nodes = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, nodes.length - itemsPerView);

  const prev = () => setIndex((v) => Math.max(0, v - 1));
  const next = () => setIndex((v) => Math.min(maxIndex, v + 1));

  const offset = `translateX(-${(index * 100) / itemsPerView}%)`;

  return (
    <div className="carousel">
      <button className="carousel__control" onClick={prev} disabled={index === 0} aria-label="Назад">
        ◀
      </button>
      <div className="carousel__window">
        <div className="carousel__track" style={{ transform: offset }}>
          {nodes.map((item, idx) => (
            <div className="carousel__slide" key={idx} style={{ width: `${100 / itemsPerView}%` }}>
              {item}
            </div>
          ))}
        </div>
      </div>
      <button
        className="carousel__control"
        onClick={next}
        disabled={index === maxIndex}
        aria-label="Вперёд"
      >
        ▶
      </button>
    </div>
  );
}
