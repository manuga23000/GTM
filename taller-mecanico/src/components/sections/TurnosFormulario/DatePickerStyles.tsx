export default function DatePickerStyles() {
  return (
    <style jsx global>{`
      .react-datepicker-wrapper {
        width: 100%;
      }

      .react-datepicker {
        background-color: #1f2937 !important;
        border: 1px solid #4b5563 !important;
        border-radius: 0.5rem !important;
        font-family: inherit !important;
      }

      .react-datepicker__header {
        background-color: #374151 !important;
        border-bottom: 1px solid #4b5563 !important;
        border-top-left-radius: 0.5rem !important;
        border-top-right-radius: 0.5rem !important;
      }

      .react-datepicker__current-month {
        color: #ffffff !important;
        font-weight: 600 !important;
      }

      .react-datepicker__day-name {
        color: #d1d5db !important;
        font-weight: 500 !important;
      }

      .react-datepicker__day {
        color: #ffffff !important;
        background-color: transparent !important;
        border-radius: 0.25rem !important;
      }

      .react-datepicker__day:hover {
        background-color: #ef4444 !important;
        color: #ffffff !important;
      }

      .react-datepicker__day--selected {
        background-color: #ef4444 !important;
        color: #ffffff !important;
      }

      .react-datepicker__day--keyboard-selected {
        background-color: #dc2626 !important;
        color: #ffffff !important;
      }

      .react-datepicker__day--disabled {
        color: #6b7280 !important;
      }

      .react-datepicker__navigation {
        color: #ffffff !important;
      }

      .react-datepicker__navigation:hover {
        background-color: #374151 !important;
        border-radius: 0.25rem !important;
      }

      .react-datepicker__input-container input {
        background-color: #374151 !important;
        border: 1px solid #4b5563 !important;
        border-radius: 0.5rem !important;
        color: #ffffff !important;
        padding: 0.75rem 0.75rem !important;
        width: 100% !important;
        font-size: 0.875rem !important;
        height: 3.1rem !important;
        line-height: 1.25rem !important;
      }

      .react-datepicker__input-container input:focus {
        outline: none !important;
        ring: 2px !important;
        ring-color: #ef4444 !important;
        border-color: transparent !important;
      }

      .react-datepicker__input-container input::placeholder {
        color: #9ca3af !important;
      }

      /* Estilos para el select con ícono de flecha */
      select {
        appearance: none !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
        background-position: right 0.75rem center !important;
        background-repeat: no-repeat !important;
        background-size: 1.5em 1.5em !important;
        padding-right: 2.5rem !important;
      }

      /* Estilos para el DatePicker con ícono de flecha */
      .react-datepicker__input-container {
        position: relative !important;
      }

      .react-datepicker__input-container::after {
        content: '' !important;
        position: absolute !important;
        right: 0.75rem !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 1.5em !important;
        height: 1.5em !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
        background-repeat: no-repeat !important;
        background-size: contain !important;
        pointer-events: none !important;
      }

      .react-datepicker__input-container input {
        padding-right: 2.5rem !important;
      }
    `}</style>
  )
}
