export function PromoBar() {
  return (
    <div
      className="mx-8 my-5 rounded-xl py-5 px-8 flex items-center justify-between"
      style={{ background: 'linear-gradient(135deg, #FFD600, #FF7A00)' }}
    >
      <div>
        <h2 className="font-pacifico text-[22px] text-white">🌞 Semana Caribeña — ¡Hasta 60% OFF!</h2>
        <p className="text-xs text-white/90 font-semibold">Solo por tiempo limitado en todas las categorías</p>
      </div>
      <button
        type="button"
        className="bg-white text-orange border-none py-2.5 px-[22px] rounded-full font-nunito font-black text-[13px] cursor-pointer shrink-0"
      >
        ¡Aprovechar ahora!
      </button>
    </div>
  );
}
