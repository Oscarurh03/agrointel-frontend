import { useEffect, useState } from 'react';
import { initParticlesEngine, Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function BackgroundParticles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles-bg"
      className="particles-bg"
      options={{
        fpsLimit: 60,
        detectRetina: true,
        particles: {
          number: { value: 45, density: { enable: true, area: 900 } },
          color: { value: ['#6fa07e', '#cf6b45', '#48788c'] },
          opacity: { value: { min: 0.15, max: 0.5 } },
          size: { value: { min: 1.5, max: 4 } },
          move: {
            enable: true,
            speed: 0.7,
            direction: 'none',
            random: true,
            outModes: 'out',
          },
          wobble: { enable: true, distance: 6, speed: 4 },
        },
        interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
      }}
    />
  );
}
