'use client'

import React, { useState, useRef, useEffect } from 'react'

export interface Country {
  name: string
  code: string // e.g. "91"
  dialCode: string // e.g. "+91"
  flag: string
  iso: string
}

export const COUNTRIES: Country[] = [
  { name: 'India', code: '91', dialCode: '+91', flag: '🇮🇳', iso: 'IN' },
  { name: 'United States', code: '1', dialCode: '+1', flag: '🇺🇸', iso: 'US' },
  { name: 'United Kingdom', code: '44', dialCode: '+44', flag: '🇬🇧', iso: 'GB' },
  { name: 'United Arab Emirates', code: '971', dialCode: '+971', flag: '🇦🇪', iso: 'AE' },
  { name: 'Saudi Arabia', code: '966', dialCode: '+966', flag: '🇸🇦', iso: 'SA' },
  { name: 'Canada', code: '1', dialCode: '+1', flag: '🇨🇦', iso: 'CA' },
  { name: 'Australia', code: '61', dialCode: '+61', flag: '🇦🇺', iso: 'AU' },
  { name: 'Germany', code: '49', dialCode: '+49', flag: '🇩🇪', iso: 'DE' },
  { name: 'France', code: '33', dialCode: '+33', flag: '🇫🇷', iso: 'FR' },
  { name: 'Singapore', code: '65', dialCode: '+65', flag: '🇸🇬', iso: 'SG' },
  { name: 'Malaysia', code: '60', dialCode: '+60', flag: '🇲🇾', iso: 'MY' },
  { name: 'Kuwait', code: '965', dialCode: '+965', flag: '🇰🇼', iso: 'KW' },
  { name: 'Qatar', code: '974', dialCode: '+974', flag: '🇶🇦', iso: 'QA' },
  { name: 'Oman', code: '968', dialCode: '+968', flag: '🇴🇲', iso: 'OM' },
  { name: 'Bahrain', code: '973', dialCode: '+973', flag: '🇧🇭', iso: 'BH' },
  { name: 'Netherlands', code: '31', dialCode: '+31', flag: '🇳🇱', iso: 'NL' },
  { name: 'Italy', code: '39', dialCode: '+39', flag: '🇮🇹', iso: 'IT' },
  { name: 'Spain', code: '34', dialCode: '+34', flag: '🇪🇸', iso: 'ES' },
  { name: 'Japan', code: '81', dialCode: '+81', flag: '🇯🇵', iso: 'JP' },
  { name: 'China', code: '86', dialCode: '+86', flag: '🇨🇳', iso: 'CN' },
  { name: 'Brazil', code: '55', dialCode: '+55', flag: '🇧🇷', iso: 'BR' },
  { name: 'South Africa', code: '27', dialCode: '+27', flag: '🇿🇦', iso: 'ZA' },
  { name: 'Indonesia', code: '62', dialCode: '+62', flag: '🇮🇩', iso: 'ID' },
  { name: 'Thailand', code: '66', dialCode: '+66', flag: '🇹🇭', iso: 'TH' },
  { name: 'Vietnam', code: '84', dialCode: '+84', flag: '🇻🇳', iso: 'VN' },
  { name: 'Philippines', code: '63', dialCode: '+63', flag: '🇵🇭', iso: 'PH' },
  { name: 'New Zealand', code: '64', dialCode: '+64', flag: '🇳🇿', iso: 'NZ' },
  { name: 'Mexico', code: '52', dialCode: '+52', flag: '🇲🇽', iso: 'MX' },
  { name: 'Argentina', code: '54', dialCode: '+54', flag: '🇦🇷', iso: 'AR' },
  { name: 'Colombia', code: '57', dialCode: '+57', flag: '🇨🇴', iso: 'CO' },
  { name: 'Chile', code: '56', dialCode: '+56', flag: '🇨🇱', iso: 'CL' },
  { name: 'Peru', code: '51', dialCode: '+51', flag: '🇵🇪', iso: 'PE' },
  { name: 'Egypt', code: '20', dialCode: '+20', flag: '🇪🇬', iso: 'EG' },
  { name: 'Nigeria', code: '234', dialCode: '+234', flag: '🇳🇬', iso: 'NG' },
  { name: 'Kenya', code: '254', dialCode: '+254', flag: '🇰🇪', iso: 'KE' },
  { name: 'Ghana', code: '233', dialCode: '+233', flag: '🇬🇭', iso: 'GH' },
  { name: 'Bangladesh', code: '880', dialCode: '+880', flag: '🇧🇩', iso: 'BD' },
  { name: 'Pakistan', code: '92', dialCode: '+92', flag: '🇵🇰', iso: 'PK' },
  { name: 'Sri Lanka', code: '94', dialCode: '+94', flag: '🇱🇰', iso: 'LK' },
  { name: 'Nepal', code: '977', dialCode: '+977', flag: '🇳🇵', iso: 'NP' },
  { name: 'South Korea', code: '82', dialCode: '+82', flag: '🇰🇷', iso: 'KR' },
  { name: 'Turkey', code: '90', dialCode: '+90', flag: '🇹🇷', iso: 'TR' },
  { name: 'Sweden', code: '46', dialCode: '+46', flag: '🇸🇪', iso: 'SE' },
  { name: 'Switzerland', code: '41', dialCode: '+41', flag: '🇨🇭', iso: 'CH' },
  { name: 'Belgium', code: '32', dialCode: '+32', flag: '🇧🇪', iso: 'BE' },
  { name: 'Austria', code: '43', dialCode: '+43', flag: '🇦🇹', iso: 'AT' },
  { name: 'Denmark', code: '45', dialCode: '+45', flag: '🇩🇰', iso: 'DK' },
  { name: 'Norway', code: '47', dialCode: '+47', flag: '🇳🇴', iso: 'NO' },
  { name: 'Finland', code: '358', dialCode: '+358', flag: '🇫🇮', iso: 'FI' },
  { name: 'Poland', code: '48', dialCode: '+48', flag: '🇵🇱', iso: 'PL' },
  { name: 'Portugal', code: '351', dialCode: '+351', flag: '🇵🇹', iso: 'PT' },
  { name: 'Ireland', code: '353', dialCode: '+353', flag: '🇮🇪', iso: 'IE' },
  { name: 'Israel', code: '972', dialCode: '+972', flag: '🇮🇱', iso: 'IL' },
  { name: 'Russia', code: '7', dialCode: '+7', flag: '🇷🇺', iso: 'RU' },
]

interface CountryPhoneInputProps {
  id?: string
  value: string // Combined format or local number
  onChange: (formattedNoPlus: string, localNumber: string, countryCode: string) => void
  onBlur?: () => void
  error?: boolean
  placeholder?: string
}

export default function CountryPhoneInput({
  id = 'contact-phone',
  value,
  onChange,
  onBlur,
  error = false,
  placeholder = '98765 43210',
}: CountryPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]) // Default India +91
  const [localNumber, setLocalNumber] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Initialize from value if passed
  useEffect(() => {
    if (!value) return
    // Remove any leading '+' for parsing
    const clean = value.trim().replace(/^\+/, '')
    const matchCountry = COUNTRIES.find((c) => clean.startsWith(c.code + ' ') || clean.startsWith(c.code))
    if (matchCountry) {
      setSelectedCountry(matchCountry)
      const numberPart = clean.slice(matchCountry.code.length).trim()
      setLocalNumber(numberPart)
    } else {
      // Stripped value
      setLocalNumber(clean)
    }
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleCountrySelect = (c: Country) => {
    setSelectedCountry(c)
    setIsOpen(false)
    setSearch('')
    // Format without '+': "91-9876543210"
    const cleanNum = localNumber.trim().replace(/^\s+/, '')
    const formatted = cleanNum ? `${c.code}-${cleanNum}` : ''
    onChange(formatted, cleanNum, c.code)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only keep numbers, spaces, and hyphens
    const newNum = e.target.value.replace(/[^\d\s-]/g, '')
    setLocalNumber(newNum)
    // Format without '+': "91-9876543210"
    const cleanNum = newNum.trim().replace(/^\s+/, '')
    const formatted = cleanNum ? `${selectedCountry.code}-${cleanNum}` : ''
    onChange(formatted, cleanNum, selectedCountry.code)
  }

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.includes(search) ||
      c.iso.toLowerCase().includes(search.toLowerCase()),
  )

  const inputBase =
    'bg-ni-surface dark:bg-[#1A1A1D] border px-4 py-3.5 text-base sm:text-sm font-body text-ni-primary w-full transition-all duration-300 rounded-r-2xl outline-none focus:ring-2 focus:ring-ni-rust/50 shadow-sm'
  const borderClass = error
    ? 'border-red-500 focus:border-red-400 focus:ring-red-400'
    : 'border-ni-border/30 dark:border-white/10 focus:border-ni-rust'

  return (
    <div ref={containerRef} className="relative flex items-center w-full">
      {/* Small Country Code Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-3.5 bg-ni-surface2/80 dark:bg-[#242428] border-y border-l ${
          error ? 'border-red-500' : 'border-ni-border/30 dark:border-white/10'
        } rounded-l-2xl text-xs sm:text-sm font-body text-ni-primary hover:bg-ni-surface2 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ni-rust/50 z-10`}
        aria-label="Select country code"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-semibold text-ni-primary">{selectedCountry.dialCode}</span>
        <span className="text-[10px] text-ni-muted ml-0.5">▼</span>
      </button>

      {/* Main Local Phone Number Input */}
      <input
        id={id}
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${inputBase} ${borderClass}`}
        aria-required="true"
      />

      {/* Searchable Dropdown Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-72 bg-white dark:bg-[#1A1A1D] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-scale-up">
          {/* Search Box */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141416]">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="w-full bg-white dark:bg-[#242428] border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-ni-primary placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-ni-rust"
            />
          </div>

          {/* Scrollable Countries List */}
          <ul className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/40 p-1">
            {filteredCountries.length === 0 ? (
              <li className="p-3 text-xs text-neutral-400 text-center">No countries found</li>
            ) : (
              filteredCountries.map((c) => (
                <li key={c.iso}>
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-xl transition-colors ${
                      selectedCountry.iso === c.iso
                        ? 'bg-[#BC4B20]/10 text-[#BC4B20] font-bold'
                        : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="font-mono text-neutral-500 dark:text-neutral-400 font-semibold ml-2 flex-shrink-0">
                      {c.dialCode}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
