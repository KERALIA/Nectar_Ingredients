import assert from 'node:assert'
import fs from 'node:fs'

const filesToCheck = [
  'components/home/Hero.tsx',
  'components/home/StatsBar.tsx',
  'components/home/B2BOverviewSection.tsx',
  'components/home/B2BIndustrySolutions.tsx',
  'components/home/ProcessSection.tsx',
  'components/home/AboutTeaser.tsx',
  'components/home/FAQSection.tsx',
  'components/home/ContactCTA.tsx',
  'components/ui/SectionHeading.tsx',
]

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf8')
  // No emoji as icons in component code
  assert(!content.includes('🍿'), `${file} must not contain emoji icons`)
  assert(!content.includes('🍲'), `${file} must not contain emoji icons`)
  assert(!content.includes('🌱'), `${file} must not contain emoji icons`)
  assert(!content.includes('🥐'), `${file} must not contain emoji icons`)
  assert(!content.includes('🧪'), `${file} must not contain emoji icons`)
  // No gradient text on headings
  assert(!content.includes('text-transparent bg-clip-text bg-gradient-to-r'), `${file} must not use gradient text`)
  // No glued arrows in buttons
  assert(!content.includes('Explore Products →'), `${file} must not have glued arrows`)
}

console.log('✔ All redesign anti-slop assertions passed successfully.')
