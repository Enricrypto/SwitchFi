import { HomeHero } from '../components/home/HomeHero';
import { HomeFeatures } from '../components/home/HomeFeatures';
import { HomeConnect } from '@/components/home/HomeConnect';
import { Faqs } from '@/src/components/Faqs/Faqs';

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeFeatures />
      <HomeConnect />
      <Faqs />
    </>
  );
}
