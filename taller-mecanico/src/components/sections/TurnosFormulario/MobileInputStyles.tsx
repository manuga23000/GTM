export default function MobileInputStyles() {
  return (
    <style jsx global>{`
      @media (max-width: 600px) {
        input, textarea, select {
          background-color: #23272b !important;
          color: #fff !important;
          box-shadow: none !important;
        }
        input::placeholder, textarea::placeholder {
          color: #bdbdbd !important;
        }
      }
    `}</style>
  )
}
