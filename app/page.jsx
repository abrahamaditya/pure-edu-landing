"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Compass,
  Layout,
  MessageCircle,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const DynamicWordCarousel = () => {
  const [dynamicWord, setDynamicWord] = useState('Strategic');

  useEffect(() => {
    const words = ['Strategic', 'Trusted', 'Creative', 'Growth'];
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % words.length;
      setDynamicWord(words[currentIndex]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span key={dynamicWord} className="word-carousel-animate font-handwriting" style={{ display: 'inline-block' }}>
      {dynamicWord}
    </span>
  );
};


const App = () => {

  useEffect(() => {
    // 1. Smooth Scroll (Lenis)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. Navbar Scroll Animation
    const nav = document.querySelector('.navbar');
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top -50',
      onEnter: () => {
        nav.classList.add('scrolled');
        nav.classList.add('hidden-mobile');
      },
      onLeaveBack: () => {
        nav.classList.remove('scrolled');
        nav.classList.remove('hidden-mobile');
        // Clear any GSAP inline styles to ensure the navbar is fully visible on mobile at the top
        gsap.set('.navbar', { clearProps: 'all' });
      }
    });

    // 3. 3 Pillars Tagline Scroll Reveal
    const taglineOrange = document.querySelector('.phrase-orange');
    const taglineBlue = document.querySelector('.phrase-blue');
    const taglineGreen = document.querySelector('.phrase-green');
    const cardStudent = document.querySelector('.pillar-card-student');
    const cardTeacher = document.querySelector('.pillar-card-teacher');
    const cardParents = document.querySelector('.pillar-card-parents');
    const pillarsSection = document.getElementById('pillars');

    let mm;
    if (pillarsSection && taglineOrange && taglineBlue && taglineGreen && cardStudent && cardTeacher && cardParents) {
      mm = gsap.matchMedia();

      mm.add("(min-width: 992px)", () => {
        // Desktop: Pin section, animate phrase color and card hover zoom sequentially in turns
        const taglineTl = gsap.timeline({
          scrollTrigger: {
            trigger: pillarsSection,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            toggleClass: { targets: pillarsSection, className: "pillars-active" }
          }
        });

        // Set initial dormant states
        gsap.set([taglineOrange, taglineBlue, taglineGreen], {
          color: 'rgba(255, 255, 255, 0.8)',
          textShadow: '0 0 0px rgba(0, 0, 0, 0)'
        });
        gsap.set([cardStudent, cardTeacher, cardParents], {
          '--scroll-active': 0
        });

        taglineTl
          // ==============================
          // 1. Student Active (phrase turns orange)
          // ==============================
          .to(taglineOrange, {
            color: '#FF8000',
            textShadow: '0 0 12px rgba(255, 128, 0, 0.85), 0 0 24px rgba(255, 128, 0, 0.45)',
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to(cardStudent, {
            '--scroll-active': 1,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<')
          .to({}, { duration: 0.6 }) // hold active state

          // ==============================
          // 2. Student Reverts & Teacher Active
          // ==============================
          .to(taglineOrange, {
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 0 0px rgba(0, 0, 0, 0)',
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to(cardStudent, {
            '--scroll-active': 0,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<')
          .to(taglineBlue, {
            color: '#00B3FF',
            textShadow: '0 0 12px rgba(0, 179, 255, 0.85), 0 0 24px rgba(0, 179, 255, 0.45)',
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<+=0.1')
          .to(cardTeacher, {
            '--scroll-active': 1,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<')
          .to({}, { duration: 0.6 }) // hold active state

          // ==============================
          // 3. Teacher Reverts & Parents Active
          // ==============================
          .to(taglineBlue, {
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 0 0px rgba(0, 0, 0, 0)',
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to(cardTeacher, {
            '--scroll-active': 0,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<')
          .to(taglineGreen, {
            color: '#00FF66',
            textShadow: '0 0 12px rgba(0, 255, 102, 0.85), 0 0 24px rgba(0, 255, 102, 0.45)',
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<+=0.1')
          .to(cardParents, {
            '--scroll-active': 1,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<')
          .to({}, { duration: 0.6 }) // hold active state

          // ==============================
          // 4. Parents Reverts on Exit
          // ==============================
          .to(taglineGreen, {
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '0 0 0px rgba(0, 0, 0, 0)',
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to(cardParents, {
            '--scroll-active': 0,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<');
      });

      mm.add("(max-width: 991px)", () => {
        // Mobile/Tablet: No pinning, just clean scroll-trigger reveal in turns
        const taglineTl = gsap.timeline({
          scrollTrigger: {
            trigger: pillarsSection,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 0.8,
            toggleClass: { targets: pillarsSection, className: "pillars-active" }
          }
        });

        // Set initial dormant states
        gsap.set([taglineOrange, taglineBlue, taglineGreen], {
          color: 'rgba(255, 255, 255, 0.8)',
          textShadow: '0 0 0px rgba(0, 0, 0, 0)'
        });
        gsap.set([cardStudent, cardTeacher, cardParents], {
          '--scroll-active': 0
        });

        taglineTl
          // 1. Student active
          .to(cardStudent, {
            '--scroll-active': 1,
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to({}, { duration: 0.6 }) // hold active state

          // 2. Student Reverts & Teacher Active
          .to(cardStudent, {
            '--scroll-active': 0,
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to(cardTeacher, {
            '--scroll-active': 1,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<+=0.1')
          .to({}, { duration: 0.6 }) // hold active state

          // 3. Teacher Reverts & Parents Active
          .to(cardTeacher, {
            '--scroll-active': 0,
            duration: 0.6,
            ease: 'power1.inOut'
          })
          .to(cardParents, {
            '--scroll-active': 1,
            duration: 0.6,
            ease: 'power1.inOut'
          }, '<+=0.1')
          .to({}, { duration: 0.6 }) // hold active state

          // Exit
          .to(cardParents, {
            '--scroll-active': 0,
            duration: 0.6,
            ease: 'power1.inOut'
          });
      });
    }

    // 4. Deco Icons Parallax
    const decoIcons = gsap.utils.toArray('.deco-icon');
    decoIcons.forEach((icon, i) => {
      const speed = (i % 3 + 1) * 30;
      const direction = i % 2 === 0 ? 1 : -1;
      gsap.to(icon, {
        scrollTrigger: {
          trigger: icon,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        y: direction * speed,
        ease: 'none'
      });
    });

    // 5. Cinematic Gallery Pinning (Rise, Fan, Deal & Drop)
    const gallerySection = document.getElementById('gallery');
    const galleryCards = gsap.utils.toArray('.gallery-card');

    if (gallerySection && galleryCards.length > 0) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gallerySection,
          start: 'top top',
          end: () => window.innerWidth <= 768 ? `+=${galleryCards.length * 120}%` : `+=${galleryCards.length * 150}%`,
          pin: true,
          scrub: true,
          refreshPriority: -1,
          onEnter: () => {
            gsap.to('.navbar', { y: -100, opacity: 0, duration: 0.2, overwrite: true });
          },
          onLeaveBack: () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled) nav.classList.add('scrolled');
            if (window.innerWidth > 768) {
              gsap.to('.navbar', { y: 0, opacity: 1, duration: 0.2, overwrite: true });
            }
          },
          onLeave: () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled) nav.classList.add('scrolled');
            if (window.innerWidth > 768) {
              gsap.to('.navbar', { y: 0, opacity: 1, duration: 0.2, overwrite: true });
            }
          },
          onEnterBack: () => {
            gsap.to('.navbar', { y: -100, opacity: 0, duration: 0.2, overwrite: true });
          }
        }
      });

      const isMobile = window.innerWidth <= 768;
      const spreadData = isMobile ? [
        { x: -80, y: -30, rotation: -4 },
        { x: 0, y: -40, rotation: 0 },
        { x: 80, y: -20, rotation: 4 },
        { x: -80, y: 180, rotation: -2 },
        { x: 0, y: 190, rotation: 2 },
        { x: 80, y: 170, rotation: -3 },
      ] : [
        { x: -375, y: 85, rotation: -2.5 },
        { x: -225, y: 75, rotation: -1 },
        { x: -75, y: 80, rotation: 0.5 },
        { x: 75, y: 70, rotation: -1.5 },
        { x: 225, y: 78, rotation: 1 },
        { x: 375, y: 82, rotation: -0.5 },
      ];

      gsap.set(galleryCards, {
        y: window.innerHeight,
        x: 0,
        rotationZ: -8,
        scale: 0.8,
        zIndex: (i) => i + 10,
        transformOrigin: 'center center'
      });

      tl.to(galleryCards, {
        y: 200,
        rotationZ: (i) => i === galleryCards.length - 1 ? -1 : (i % 2 === 0 ? -6 : 5),
        scale: 1,
        duration: 2,
        ease: 'power3.out'
      });

      tl.addLabel("spread");
      const tilts = [-2, 1.5, -1, 2, -1.5, 1];
      galleryCards.forEach((card, i) => {
        tl.to(card, {
          x: spreadData[i].x,
          y: spreadData[i].y,
          rotationZ: spreadData[i].rotation,
          duration: 2,
          ease: 'power3.inOut'
        }, "spread");
      });

      tl.addLabel("deal", "+=1");
      let dealTime = tl.labels.deal;

      const isMobileZoom = window.innerWidth <= 768;
      const zoomScale = isMobileZoom ? 2.2 : 1.6;

      for (let i = galleryCards.length - 1; i >= 0; i--) {
        tl.to(galleryCards[i], {
          x: 0,
          y: 0,
          rotationZ: tilts[i] || 0,
          scale: zoomScale,
          zIndex: 100,
          duration: 1.5,
          ease: 'power2.out'
        }, dealTime);

        tl.to(galleryCards[i], {
          y: window.innerHeight + 300,
          scale: 1,
          duration: 1.5,
          ease: 'power2.in'
        }, dealTime + 1.5);

        dealTime += 1.5;
      }
    }

    // 6. Program M.O.TI.O.N Dynamic Card Highlighting
    const programSection = document.getElementById('program');
    const stickyLeft = document.querySelector('.sticky-left-box');
    if (programSection && stickyLeft) {
      // Dynamic Highlight for Cards (Immediate Hand-off)
      const stepCards = gsap.utils.toArray('.modern-step-card');
      stepCards.forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top center',
          end: 'bottom center',
          toggleClass: 'step-card-highlight'
        });
      });
    }

    // 7. About Us Image Swap Pinning
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: true,
          anticipatePin: 1
        }
      });

      // Part 1: Top image slides out
      const isMobileAbout = window.innerWidth <= 768;
      aboutTl.to('.about-img-top', {
        x: isMobileAbout ? -150 : -300,
        rotate: -15,
        scale: 0.95,
        duration: 1
      });

      // Part 2: Top image moves behind and back to center with an offset
      aboutTl.set('.about-img-top', { zIndex: 0 });

      aboutTl.to('.about-img-top', {
        x: isMobileAbout ? 8 : 15,
        y: isMobileAbout ? -8 : -15,
        rotate: 8,
        scale: 0.92,
        duration: 1
      });

      aboutTl.to('.about-img-bottom', {
        scale: 1,
        rotate: 0,
        zIndex: 2,
        boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
        duration: 1
      }, '>-0.5');
    }

    // 8. Stats Counter Animation
    const statsElements = gsap.utils.toArray('.stat-value');
    statsElements.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      const hasComma = stat.getAttribute('data-comma') === 'true';

      gsap.to({ val: 0 }, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stat,
          start: 'top 95%',
          once: true
        },
        onUpdate: function () {
          let current = Math.floor(this.targets()[0].val);
          stat.innerText = (hasComma ? current.toLocaleString() : current) + suffix;
        }
      });
    });

    // 9. Service Titles Writing Animation (Per Letter)
    gsap.utils.toArray('.animate-writing').forEach((title) => {
      const chars = title.querySelectorAll('.char');
      gsap.fromTo(chars,
        {
          opacity: 0,
          y: 10,
          rotate: 5
        },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // 10. Head to Toe Journey Visual Highlighting & Image Swap
    const journeySections = gsap.utils.toArray('.journey-section');
    const journeyImage = document.querySelector('#journey-image');
    let currentJourneySrc = '/assets/image/section_5_1.webp';

    const getSrcForPart = (part) => {
      if (['ear', 'mouth', 'eyes', 'neck'].includes(part)) return '/assets/image/section_5_2.webp';
      if (['shoulder', 'heart', 'hand'].includes(part)) return '/assets/image/section_5_3.webp';
      if (part === 'leg') return '/assets/image/section_5_4.webp';
      return '/assets/image/section_5_1.webp';
    };

    journeySections.forEach((section, index) => {
      const part = section.getAttribute('data-part');
      const currentSrc = getSrcForPart(part);
      const prevSrc = index > 0 ? getSrcForPart(journeySections[index - 1].getAttribute('data-part')) : '/assets/image/section_5_1.webp';
      const cardContent = section.querySelector('.min-card-content');

      ScrollTrigger.create({
        trigger: section,
        start: 'center 75%',
        end: 'center 75%',
        onEnter: () => {
          gsap.to(`.min-card-content`, { opacity: 0.2, x: 0, duration: 0.3, overwrite: true });
          journeySections.forEach(s => s.classList.remove('active-card'));

          if (cardContent) {
            gsap.to(cardContent, { opacity: 1, x: 15, duration: 0.4, ease: 'power2.out', overwrite: true });
          }
          section.classList.add('active-card');

          if (journeyImage) {
            currentJourneySrc = currentSrc;
            journeyImage.src = currentSrc;
          }
        },
        onEnterBack: () => {
          gsap.to(`.min-card-content`, { opacity: 0.2, x: 0, duration: 0.3, overwrite: true });
          journeySections.forEach(s => s.classList.remove('active-card'));

          if (cardContent) {
            gsap.to(cardContent, { opacity: 1, x: 15, duration: 0.4, ease: 'power2.out', overwrite: true });
          }
          section.classList.add('active-card');

          if (journeyImage) {
            currentJourneySrc = currentSrc;
            journeyImage.src = currentSrc;
          }
        },
        onLeaveBack: () => {
          if (journeyImage) {
            currentJourneySrc = prevSrc;
            journeyImage.src = prevSrc;
          }
          if (index > 0) {
            const prevSection = journeySections[index - 1];
            const prevContent = prevSection.querySelector('.min-card-content');

            gsap.to(`.min-card-content`, { opacity: 0.2, x: 0, duration: 0.3, overwrite: true });
            journeySections.forEach(s => s.classList.remove('active-card'));

            if (prevContent) {
              gsap.to(prevContent, { opacity: 1, x: 15, duration: 0.4, ease: 'power2.out', overwrite: true });
            }
            prevSection.classList.add('active-card');
          } else {
            gsap.to(`.min-card-content`, { opacity: 0.2, x: 0, duration: 0.3, overwrite: true });
            journeySections.forEach(s => s.classList.remove('active-card'));
          }
        }
      });
    });

    // Reset to initial image when scrolling back to the very top of the journey section
    const journeyWrapper = document.querySelector('.journey-wrapper');
    if (journeyWrapper) {
      ScrollTrigger.create({
        trigger: journeyWrapper,
        start: 'top bottom',
        onLeaveBack: () => {
          if (journeyImage && currentJourneySrc !== '/assets/image/section_5_1.webp') {
            currentJourneySrc = '/assets/image/section_5_1.webp';
            journeyImage.src = currentJourneySrc;
          }
        }
      });
    }

    // Clean up
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      if (mm) mm.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <a href="#home" className="logo" aria-label="Kembali ke beranda PURE Education">
          <img src="/assets/logo/logo-pure-edu.png" alt="Pure Education Logo" className="logo-main" style={{ height: '55px' }} />
        </a>
        <ul className="nav-links">
          <li><a href="#about" aria-label="Navigasi ke bagian Tentang Kami">Tentang</a></li>
          <li><a href="#services" aria-label="Navigasi ke bagian Layanan Kami">Layanan</a></li>
          <li><a href="#program" aria-label="Navigasi ke bagian Program M.O.T.I.O.N">Program</a></li>
          <li><a href="#classes" aria-label="Navigasi ke bagian Metode Pembelajaran">Metode</a></li>
          <li><a href="#contact" aria-label="Navigasi ke bagian Kontak Kami">Kontak</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#contact" className="btn btn-blue" aria-label="Hubungi PURE Education sekarang">Hubungi Kami</a>
        </div>
      </nav>

      <main className="scroll-container" role="main">

        {/* Compact Premium Hero Section */}
        <section id="home" className="hero-compact">
          <div className="compact-container">
            <div className="compact-content">
              <h1 className="title-compact">
                Your<DynamicWordCarousel /> <br />
                <span className="text-gradient">Education</span> Partner
              </h1>
              <p className="desc-compact">
                <strong>Unlocking potential through meaningful learning experiences designed for growth.</strong>
                <span style={{ display: 'block', marginTop: '12px', fontSize: '1rem', opacity: 0.85 }}>
                  Kami percaya setiap individu memiliki potensi luar biasa—dan kami hadir membantu Anda menemukan kunci yang tepat untuk membukanya.
                </span>
              </p>

              <div className="cta-row-compact">
                <a href="#contact" id="cta-mulai-sekarang" className="btn btn-blue" aria-label="Mulai program PURE Education sekarang">Mulai Sekarang</a>
                <div className="social-divider"></div>
                <div className="social-group-compact">
                  <a href="https://www.instagram.com/pureedu.tco/" target="_blank" rel="noopener noreferrer" className="hero-social-circle instagram-btn" aria-label="Kunjungi Instagram PURE Education">
                    <div className="social-icon-wrapper"><Icon icon="mdi:instagram" /></div>
                    <span className="social-expand-text">Lihat Program Terbaru</span>
                  </a>
                  <a href="https://linktr.ee/pure_tco" target="_blank" rel="noopener noreferrer" className="hero-social-circle linktree-btn" aria-label="Kunjungi Linktree PURE Education">
                    <div className="social-icon-wrapper"><Icon icon="simple-icons:linktree" /></div>
                    <span className="social-expand-text">Akses Semua Informasi</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="compact-visual">
              <div className="image-stack-compact">
                <div className="img-backdrop-compact"></div>
                <img src="/assets/image/section_1.webp" alt="Siswa belajar dan berkolaborasi dalam program PURE Education" className="hero-img-compact" />

                {/* Re-introducing Floating "Flying" Elements with distinct animations */}
                <div className="floating-card-compact card-top animate-float-1">
                  <div className="icon-box-mini"><Icon icon="solar:star-bold" /></div>
                  <div>
                    <p className="f-title">Experiential Learning</p>
                    <p className="f-sub">Fun & Meaningful</p>
                  </div>
                </div>

                <div className="floating-card-compact card-mid animate-float-2">
                  <div className="icon-box-mini bg-green"><Icon icon="solar:heart-bold" /></div>
                  <div>
                    <p className="f-title">Psychology-Based</p>
                    <p className="f-sub">Interactive & Reflective</p>
                  </div>
                </div>

                <div className="floating-card-compact card-bottom animate-float-3">
                  <div className="icon-box-mini" style={{ background: 'var(--primary-dark)' }}>
                    <Icon icon="solar:magic-stick-bold" />
                  </div>
                  <div>
                    <p className="f-title">Tailored Program</p>
                    <p className="f-sub">Designed for Your Needs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section id="stats" className="stats-section" aria-label="Statistik Dampak PURE Education">
          <div className="stats-container">
            {[
              { value: 10000, suffix: '+', label: 'Siswa Bertumbuh', comma: true },
              { value: 500, suffix: '+', label: 'Guru & Pendidik Terlibat', comma: false },
              { value: 250, suffix: '+', label: 'Program Pembelajaran', comma: false },
              { value: 70, suffix: '+', label: 'Institusi Bermitra', comma: false }
            ].map((stat, i) => (
              <React.Fragment key={i}>
                <div className="stat-item">
                  <div className="stat-value"
                    data-target={stat.value}
                    data-suffix={stat.suffix}
                    data-comma={stat.comma ? 'true' : 'false'}>
                    0{stat.suffix}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                {i < 3 && <div className="stat-divider"></div>}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section id="clients" className="clients-section" aria-label="Mitra Strategis PURE Education">
          <div className="clients-container">
            <span className="clients-label font-handwriting" style={{ textTransform: 'none', lineHeight: '1' }}>
              <span style={{ color: 'var(--primary-dark)', fontSize: '1.8rem', paddingLeft: '10px' }}>Partner Pembelajaran untuk</span><br />
              <span style={{ color: 'var(--brand-orange)', fontSize: '3rem' }}>Berbagai Institusi:</span>
            </span>
            <div className="clients-marquee">
              <div className="clients-track track-right">
                <div className="logos-group">
                  {[
                    'logo-tunas-muda.png', 'logo-kinderfield.png', 'logo-itb.png',
                    'logo-universal.png', 'logo-ichthus.png', 'logo-ricci.png',
                    'logo-esa-unggu.png', 'logo-sdh.png', 'logo-lpt-ui.png'
                  ].map((logo, i) => (
                    <div key={`r1-${i}`} className="client-logo">
                      <img src={`/assets/logo/${logo}`} alt={logo.replace('logo-', '').replace('.png', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' — Mitra PURE Education'} />
                    </div>
                  ))}
                </div>
                <div className="logos-group">
                  {[
                    'logo-tunas-muda.png', 'logo-kinderfield.png', 'logo-itb.png',
                    'logo-universal.png', 'logo-ichthus.png', 'logo-ricci.png',
                    'logo-esa-unggu.png', 'logo-sdh.png', 'logo-lpt-ui.png'
                  ].map((logo, i) => (
                    <div key={`r1-dup-${i}`} className="client-logo">
                      <img src={`/assets/logo/${logo}`} alt={logo.replace('logo-', '').replace('.png', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' — Mitra PURE Education'} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="clients-track track-left">
                <div className="logos-group">
                  {[
                    'logo-penabur-international.png', 'logo-apple-tree.png', 'logo-global-prestasi.png',
                    'logo-uph.png', 'logo-springfield.png', 'logo-john-paul.png',
                    'logo-atma-jaya.png', 'logo-penabur.png'
                  ].map((logo, i) => (
                    <div key={`r2-${i}`} className="client-logo">
                      <img src={`/assets/logo/${logo}`} alt={logo.replace('logo-', '').replace('.png', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' — Mitra PURE Education'} />
                    </div>
                  ))}
                </div>
                <div className="logos-group">
                  {[
                    'logo-penabur-international.png', 'logo-apple-tree.png', 'logo-global-prestasi.png',
                    'logo-uph.png', 'logo-springfield.png', 'logo-john-paul.png',
                    'logo-atma-jaya.png', 'logo-penabur.png'
                  ].map((logo, i) => (
                    <div key={`r2-dup-${i}`} className="client-logo">
                      <img src={`/assets/logo/${logo}`} alt={logo.replace('logo-', '').replace('.png', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' — Mitra PURE Education'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tentang Kami */}
        <section id="about" className="features-section">
          <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: '80px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="about-visual-stack" style={{ position: 'relative', height: '350px', width: '100%', perspective: '1000px' }}>
              {/* Bottom Image (Back Card) */}
              <div className="about-img-bottom" style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                width: '100%',
                height: '100%',
                borderRadius: '32px',
                overflow: 'hidden',
                
                zIndex: 1,
                transform: 'rotate(8deg) scale(0.92)'
              }}>
                <img src="/assets/image/section_2_2.webp" alt="Peserta program PURE Education mengalami transformasi positif" loading="lazy" width={500} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Top Image (Front Card) */}
              <div className="about-img-top" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                zIndex: 2,
                background: 'white'
              }}>
                <img src="/assets/image/section_2_1.webp" alt="Tim fasilitator PURE Education dalam sesi pelatihan interaktif" loading="lazy" width={500} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div>
              <h2 className="section-title">Tentang<span className="font-handwriting">Kami</span><span style={{position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)'}}> — Partner Edukasi Life Skills Terpercaya</span></h2>
              <p style={{ fontSize: '1rem', color: '#64748B', marginBottom: '20px', lineHeight: 1.5 }}>
                Sejak 2010, <strong>PURE Education</strong> menghadirkan pengalaman belajar yang interaktif dan bermakna untuk membantu setiap individu mengenali, mengembangkan, dan membuka potensinya. Program kami dirancang secara personal bagi siswa, guru, hingga institusi melalui pendekatan psikologi dan experiential learning.
              </p>

              <div>
                <h3 className="font-handwriting" style={{ fontSize: '1.8rem', marginBottom: '12px', textTransform: 'none', letterSpacing: 'normal', marginLeft: 0 }}>
                  Prinsip yang kami percaya:
                </h3>
                <div className="values-grid">
                  {[
                    { title: 'Psychological Approach', desc: 'Memahami potensi melalui pendekatan psikologi.', icon: 'solar:plain-2-bold-duotone', color: '#EA6319' },
                    { title: 'Experiential Learning', desc: 'Belajar melalui pengalaman yang aktif dan bermakna.', icon: 'solar:star-bold-duotone', color: '#488765' },
                    { title: 'Continuous Growth', desc: 'Mendukung proses belajar dan perkembangan berkelanjutan.', icon: 'solar:graph-up-bold-duotone', color: '#3B82F6' },
                    { title: 'Tailored Program', desc: 'Program yang dirancang sesuai kebutuhan setiap individu dan institusi.', icon: 'solar:magic-stick-bold-duotone', color: '#8B5CF6' }
                  ].map((v, i) => (
                    <div key={i} className="value-card-compact">
                      <div className="value-icon-box" style={{ background: `${v.color}15`, color: v.color }}>
                        <Icon icon={v.icon} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px', color: '#0F172A', lineHeight: 1.2 }}>{v.title}</h4>
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#64748B',
                          lineHeight: 1.4,
                          margin: 0
                        }}>{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Pillars Section */}
        <style dangerouslySetInnerHTML={{__html: `
          .pillar-card {
            position: relative;
            overflow: hidden;
            background: rgba(15, 23, 42, 0.68) !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 32px !important;
            will-change: transform;

            /* Apply custom CSS variables for scroll active */
            --scroll-active: 0;
            --scroll-y: calc(var(--scroll-active) * -12px);
            --scroll-scale: calc(1 + var(--scroll-active) * 0.02);
            transform: translateY(var(--scroll-y)) scale(var(--scroll-scale)) !important;
          }
          .pillar-card-student {
            --accent-color: #FF8000;
            --glow-color: rgba(255, 128, 0, 0.25);
          }
          .pillar-card-teacher {
            --accent-color: #00B3FF;
            --glow-color: rgba(0, 179, 255, 0.25);
          }
          .pillar-card-parents {
            --accent-color: #00FF66;
            --glow-color: rgba(0, 255, 102, 0.25);
          }

          /* Title text always white */
          .pillar-card h3,
          .pillar-card:hover h3 {
            color: white !important;
          }

          /* Default border static - tipis & elegan */
          .pillar-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 32px;
            padding: 2px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.8;
            pointer-events: none;
          }
          
          /* Active Glow Layer - terakselerasi GPU */
          .pillar-card-glow {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 32px;
            opacity: var(--scroll-active, 0) !important;
            pointer-events: none;
            z-index: 0;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: opacity;
            background: rgba(255, 255, 255, 0.02) !important;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          }
          .pillar-card-glow::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 32px;
            padding: 2px;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }

          /* Border aktif statis untuk tiap pilar */
          .pillar-card-student .pillar-card-glow::before {
            background: linear-gradient(135deg, #EA6319, rgba(234, 99, 25, 0));
          }
          .pillar-card-teacher .pillar-card-glow::before {
            background: linear-gradient(135deg, #3B82F6, rgba(59, 130, 246, 0));
          }
          .pillar-card-parents .pillar-card-glow::before {
            background: linear-gradient(135deg, #488765, rgba(72, 135, 101, 0));
          }

          /* Hover manual untuk desktop & mobile (selalu aktif) */
          .pillar-card:hover {
            transform: translateY(-12px) scale(1.02) !important;
            background: rgba(15, 23, 42, 0.80) !important;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4) !important;
          }
          .pillar-card:hover .pillar-card-glow {
            opacity: 1 !important;
          }

          .pillar-content-front {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .pillar-icon-box {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;

            /* Apply custom CSS variables for scroll active */
            --scroll-icon-scale: calc(1 + var(--scroll-active, 0) * 0.15);
            --scroll-icon-rotate: calc(var(--scroll-active, 0) * 8deg);
            transform: scale(var(--scroll-icon-scale)) rotate(var(--scroll-icon-rotate)) !important;
          }
          .pillar-card:hover .pillar-icon-box {
            transform: scale(1.15) rotate(8deg) !important;
            box-shadow: 0 20px 40px var(--glow-color) !important;
          }

          .pillar-tag {
            padding: 8px 16px;
            background: var(--tag-bg);
            border: 1px solid var(--tag-border);
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--tag-color);
            transition: all 0.3s ease;
          }
          .pillar-tag:hover {
            transform: translateY(-2px);
            background: var(--tag-bg-hover);
          }
          .reveal-phrase {
            color: rgba(255, 255, 255, 0.8);
            display: inline-block;
            transition: transform 0.3s ease, text-shadow 0.3s ease, color 0.3s ease;
          }
          .phrase-orange {
            --reveal-color: #FF8000;
          }
          .phrase-blue {
            --reveal-color: #00B3FF;
          }
          .phrase-green {
            --reveal-color: #00FF66;
          }
          @media (max-width: 768px) {
            .pillar-tagline {
              font-size: 1.25rem !important;
              line-height: 1.5 !important;
            }
          }

          .pillar-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
          }
          @media (max-width: 992px) {
            .pillar-grid {
              grid-template-columns: 1fr;
              gap: 30px;
            }
          }
        `}} />
        <section id="pillars" className="features-section" aria-label="3 Pilar Utama PURE Education" style={{
          position: 'relative',
          backgroundImage: 'url(/assets/background-school.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '140px 0',
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Dark overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 100%)',
            zIndex: 1
          }}></div>
          
          {/* Abstract glowing blobs for premium aesthetic */}
          <div style={{ position: 'absolute', top: '0%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(234, 99, 25, 0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(72, 135, 101, 0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1, pointerEvents: 'none' }}></div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', color: 'white', lineHeight: 1.1 }}>
                3 Pilar<span className="font-handwriting" style={{ color: '#EA6319', fontSize: '4.5rem', display: 'inline-block', transform: 'rotate(-2deg) translateY(5px)', marginLeft: '10px' }}>Utama</span>
              </h2>
              <p className="pillar-tagline" style={{ fontSize: '1.6rem', color: 'rgba(255,255,255,0.8)', maxWidth: '850px', margin: '0 auto', fontStyle: 'italic', fontWeight: 700, letterSpacing: '0.5px', lineHeight: 1.6 }}>
                <span className="reveal-phrase phrase-orange">Growing student</span>,{' '}
                <span className="reveal-phrase phrase-blue">empowering teachers</span>,{' '}
                <span className="reveal-phrase phrase-green">partnering parents.</span>
              </p>
            </div>

            <div className="pillar-grid">
              {/* Student */}
              <div className="pillar-card pillar-card-student" style={{ padding: '50px 40px' }}>
                <div className="pillar-card-glow"></div>
                <div className="pillar-content-front">
                  <div className="pillar-icon-box" style={{ '--glow-color': 'rgba(234, 99, 25, 0.4)', width: '72px', height: '72px', background: 'linear-gradient(135deg, #EA6319, #FF8C4B)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', fontSize: '36px', boxShadow: '0 10px 25px rgba(234, 99, 25, 0.3)' }}>
                    <Icon icon="solar:users-group-two-rounded-bold-duotone" color="white" />
                  </div>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'white', letterSpacing: '-0.5px' }}>Student</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '32px', fontWeight: 500 }}>Growing potential, shaping character.</p>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="solar:dumbbells-bold-duotone" style={{ color: '#EA6319', fontSize: '24px' }} />
                        PURE Motion
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', fontWeight: 400 }}>
                        Program pengembangan life skills untuk membantu peserta berpikir, bertindak, dan bertumbuh secara bertahap.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', '--tag-bg': 'rgba(234,99,25,0.1)', '--tag-bg-hover': 'rgba(234,99,25,0.2)', '--tag-border': 'rgba(234,99,25,0.2)', '--tag-color': '#FFB085' }}>
                        <span className="pillar-tag">Head to Toe Program</span>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0))' }}></div>

                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="solar:diploma-bold-duotone" style={{ color: '#EA6319', fontSize: '24px' }} />
                        School Program
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', fontWeight: 400 }}>
                        Pembentukan karakter & kepemimpinan di sekolah.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', '--tag-bg': 'rgba(234,99,25,0.1)', '--tag-bg-hover': 'rgba(234,99,25,0.2)', '--tag-border': 'rgba(234,99,25,0.2)', '--tag-color': '#FFB085' }}>
                        <span className="pillar-tag">Character Camp</span>
                        <span className="pillar-tag">Motivational Day</span>
                        <span className="pillar-tag">Leadership Camp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher */}
              <div className="pillar-card pillar-card-teacher" style={{ padding: '50px 40px' }}>
                <div className="pillar-card-glow"></div>
                <div className="pillar-content-front">
                  <div className="pillar-icon-box" style={{ '--glow-color': 'rgba(59, 130, 246, 0.4)', width: '72px', height: '72px', background: 'linear-gradient(135deg, #3B82F6, #60A5FA)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', fontSize: '36px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}>
                    <Icon icon="solar:user-id-bold-duotone" color="white" />
                  </div>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'white', letterSpacing: '-0.5px' }}>Teacher</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '32px', fontWeight: 500 }}>Empowering educators to inspire.</p>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="solar:square-academic-cap-bold-duotone" style={{ color: '#3B82F6', fontSize: '24px' }} />
                        Workshop
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', fontWeight: 400 }}>
                        Peningkatan kompetensi pedagogik & manajemen kelas.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', '--tag-bg': 'rgba(59,130,246,0.1)', '--tag-bg-hover': 'rgba(59,130,246,0.2)', '--tag-border': 'rgba(59,130,246,0.2)', '--tag-color': '#93C5FD' }}>
                        <span className="pillar-tag">Creative Teaching</span>
                        <span className="pillar-tag">Stress Management</span>
                        <span className="pillar-tag">Student Engagement</span>
                        <span className="pillar-tag">Behavior</span>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0))' }}></div>

                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="solar:users-group-rounded-bold-duotone" style={{ color: '#3B82F6', fontSize: '24px' }} />
                        Team Building
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', fontWeight: 400 }}>
                        Mempererat kolaborasi & sinergi antar pendidik.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', '--tag-bg': 'rgba(59,130,246,0.1)', '--tag-bg-hover': 'rgba(59,130,246,0.2)', '--tag-border': 'rgba(59,130,246,0.2)', '--tag-color': '#93C5FD' }}>
                        <span className="pillar-tag">Synergy & Trust</span>
                        <span className="pillar-tag">Communication Skill</span>
                        <span className="pillar-tag">Collaboration</span>
                        <span className="pillar-tag">Fun Dynamics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents */}
              <div className="pillar-card pillar-card-parents" style={{ padding: '50px 40px' }}>
                <div className="pillar-card-glow"></div>
                <div className="pillar-content-front">
                  <div className="pillar-icon-box" style={{ '--glow-color': 'rgba(72, 135, 101, 0.4)', width: '72px', height: '72px', background: 'linear-gradient(135deg, #488765, #6BC093)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', fontSize: '36px', boxShadow: '0 10px 25px rgba(72, 135, 101, 0.3)' }}>
                    <Icon icon="solar:home-smile-bold-duotone" color="white" />
                  </div>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'white', letterSpacing: '-0.5px' }}>Parents</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '32px', fontWeight: 500 }}>Partnering for a better future.</p>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="solar:hearts-bold-duotone" style={{ color: '#488765', fontSize: '24px' }} />
                        Parenting Class
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', fontWeight: 400 }}>
                        Sesi edukasi psikologi anak & pola asuh modern.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', '--tag-bg': 'rgba(72,135,101,0.1)', '--tag-bg-hover': 'rgba(72,135,101,0.2)', '--tag-border': 'rgba(72,135,101,0.2)', '--tag-color': '#A2DAB9' }}>
                        <span className="pillar-tag">Positive Parenting</span>
                        <span className="pillar-tag">Child Psychology</span>
                        <span className="pillar-tag">Emotion Regulation</span>
                        <span className="pillar-tag">Active Listening</span>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0))' }}></div>

                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon icon="solar:chat-square-like-bold-duotone" style={{ color: '#488765', fontSize: '24px' }} />
                        Parents Community
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4', fontWeight: 400 }}>
                        Wadah berbagi & diskusi untuk tumbuh bersama.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', '--tag-bg': 'rgba(72,135,101,0.1)', '--tag-bg-hover': 'rgba(72,135,101,0.2)', '--tag-border': 'rgba(72,135,101,0.2)', '--tag-color': '#A2DAB9' }}>
                        <span className="pillar-tag">Sharing Session</span>
                        <span className="pillar-tag">Family Discussion</span>
                        <span className="pillar-tag">Expert Talk</span>
                        <span className="pillar-tag">Support Group</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Layanan */}
        <section id="services" className="features-section services-section-orange">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="section-header">
              <h2>Layanan<span className="font-handwriting" style={{ color: '#FFFFFF', opacity: 1, marginLeft: '10px' }}>Kami</span><span style={{position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)'}}> untuk Siswa, Guru, dan Orang Tua</span></h2>
              <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>Menghadirkan pengalaman belajar dan pengembangan untuk siswa, orang tua, dan sekolah dalam membangun ekosistem pendidikan yang bertumbuh bersama.</p>
            </div>
            <div className="modern-alternating-services">
              {[
                { icon: 'fluent-emoji:light-bulb', title: 'Training & Character Development', desc: 'Program interaktif untuk mengembangkan karakter, self-awareness, leadership, resilience, dan keterampilan sosial melalui experiential learning dan pendekatan psikologi.', img: '/assets/image/section_3_1.webp' },
                { icon: 'fluent-emoji:books', title: 'Learning Resources', desc: 'Penyediaan modul dan pengalaman pembelajaran yang relevan untuk mendukung perkembangan life skills, karakter, dan kesiapan menghadapi tantangan masa kini.', img: '/assets/image/section_3_2.webp' },
                { icon: 'fluent-emoji:school', title: 'School Partnership', desc: 'Berkolaborasi bersama sekolah dan pendidik untuk menciptakan pengalaman belajar yang suportif, bermakna, dan sesuai dengan kebutuhan perkembangan peserta didik.', img: '/assets/image/section_3_3.webp' }
              ].map((service, i) => (
                <div key={i} className={`service-row ${i % 2 === 1 ? 'row-reverse' : ''}`}>
                  <div className="service-row-image" role="img" aria-label={`${service.title} — layanan PURE Education`} style={{ backgroundImage: `url(${service.img})` }}></div>
                  <div className="service-row-content">
                    <span className="row-number">0{i + 1}</span>
                    <h3 className="animate-writing">
                      {service.title.split(' ').map((word, wordIndex) => (
                        <span key={wordIndex} className="word" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {word.split('').map((char, charIndex) => (
                            <span key={charIndex} className="char">{char}</span>
                          ))}
                          {/* Add space after each word except the last one */}
                          {wordIndex < service.title.split(' ').length - 1 && <span className="char">&nbsp;</span>}
                        </span>
                      ))}
                    </h3>
                    <p>{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Program M.O.T.I.O.N (GSAP Pinning Layout) */}
        <section id="program" className="features-section allow-sticky" style={{ background: '#FFFFFF', paddingTop: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '80px', maxWidth: '1000px', margin: '0 auto' }}>

            {/* Left: Sticky Context */}
            <div className="sticky-left-box" style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignSelf: 'start' }}>
              <div style={{ textAlign: 'left', maxWidth: '420px', width: '100%' }}>
                <h3 style={{ fontSize: '3.2rem', fontWeight: 900, marginTop: '16px', lineHeight: 1.1 }}>
                  Memahami<br /><span className="font-handwriting" style={{ marginLeft: 0 }}>Tantangan</span>
                </h3>
                <p style={{ color: '#64748B', marginTop: '24px', fontSize: '1.2rem', lineHeight: 1.6 }}>
                  Di era digital dan globalisasi sekarang, khususnya bagi anak dan keluarga, terdapat <strong>5 tantangan utama</strong> yang dihadapi oleh anak muda dan remaja masa kini.
                </p>
              </div>
            </div>

            {/* Right: Scrolling Steps (Kartu yang berjalan) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingTop: '25vh', paddingBottom: '30vh' }}>
              {[
                { title: 'Membuat Pilihan', desc: 'Digitalisasi dan globalisasi memberikan berbagai pilihan bagi anak muda dalam menentukan karir, pasangan, corak iman, dan gaya hidup.' },
                { title: 'Belajar Mandiri', desc: 'Kemampuan untuk terus belajar mandiri sangat diperlukan karena mereka hidup di tengah perubahan serba cepat dan persaingan yang ketat.' },
                { title: 'Berelasi & Berbagi', desc: 'Tantangan untuk mampu berkomunikasi, berelasi, dan berbagi hidup dengan orang-orang yang serupa maupun berbeda dari diri mereka.' },
                { title: 'Arah Keberhasilan', desc: 'Menentukan arah hidup dan ukuran keberhasilan di tengah tawaran keberhasilan yang materialistis maupun berfokus pada egosentrisme.' },
                { title: 'Karakter Spiritual', desc: 'Menumbuhkan karakter yang memungkinkan mereka hidup konsisten sesuai nilai spiritualitas, bukan sekadar terjebak pada rutinitas keagamaan.' }
              ].map((item, i) => (
                <div key={i} className="modern-step-card">
                  <div className="step-number">0{i + 1}</div>
                  <div>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#0F172A' }}>{item.title}</h4>
                    <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solusi Head to Toe (Sticky Stacking Layout) */}
        <section className="features-section services-section-green allow-sticky" style={{ padding: '120px 0' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '900px', margin: '0 auto 80px auto' }}>
              <h2 style={{ marginTop: '16px', fontSize: '3rem', fontWeight: 900, lineHeight: 1.2, color: 'white' }}>Program<span className="font-handwriting" style={{ color: 'white' }}>Head to Toe</span></h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '24px', fontSize: '1.2rem', lineHeight: 1.8 }}>
                Program pengembangan holistik yang mengintegrasikan aspek psikologis, emosional, dan fisik untuk membekali generasi muda menghadapi tantangan masa depan.
              </p>
            </div>

            {/* Main Goals Cards */}
            {/* Main Goals Cards (Styled like Learning Methods / modern-service-card) */}
            <div className="goal-grid-j">
              <div className="goal-card-j">
                <div className="modern-service-icon" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', margin: '0 auto 32px' }}>
                  <Icon icon="solar:star-fall-bold-duotone" />
                </div>
                <h4>Potensi Holistik</h4>
                <p>Mengoptimalkan setiap aspek pertumbuhan dari pola pikir hingga langkah nyata dalam kehidupan.</p>
              </div>

              <div className="goal-card-j">
                <div className="modern-service-icon" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', margin: '0 auto 32px' }}>
                  <Icon icon="solar:heart-pulse-bold-duotone" />
                </div>
                <h4>Pendekatan Psikologis</h4>
                <p>Metode yang menyentuh sisi emosional dan mental untuk perubahan karakter yang berkelanjutan.</p>
              </div>

              <div className="goal-card-j">
                <div className="modern-service-icon" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', margin: '0 auto 32px' }}>
                  <Icon icon="solar:medal-star-bold-duotone" />
                </div>
                <h4>Manusia yang Utuh</h4>
                <p>Membentuk pribadi yang tangguh, berintegritas, dan siap menghadapi tantangan masa depan.</p>
              </div>
            </div>

            {/* 2. The Journey: Head to Toe Split Layout */}
            <div className="journey-wrapper">
              <div className="journey-visual-side">
                <div className="journey-image-container">
                  <img
                    src="/assets/image/section_5_1.webp"
                    className="journey-dynamic-image"
                    id="journey-image"
                    alt="Program Head to Toe"
                  />
                </div>
              </div>

              <div className="journey-content-side">
                {/* 1. HEAD GROUP */}
                <div className="journey-minimal-group">
                  <div className="minimal-phase-header">
                    <span className="min-phase-num">01</span>
                    <h2 className="min-phase-name">Head (Mindset)</h2>
                  </div>

                  <div className="journey-section minimal-item" data-part="ear">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#3B82F6', '--glow-color': 'rgba(59, 130, 246, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="healthicons:ear-outline" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Ear</h3>
                          <h4 className="min-meaning">Mendengarkan dengan Empati</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Mendengarkan Aktif (Active Listening)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="journey-section minimal-item" data-part="mouth">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#EC4899', '--glow-color': 'rgba(236, 72, 153, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="healthicons:mouth-outline" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Mouth</h3>
                          <h4 className="min-meaning">Komunikasi</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Public Speaking</li>
                          <li>Komunikasi Asertif</li>
                          <li>Fleksibilitas</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="journey-section minimal-item" data-part="eyes">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#8B5CF6', '--glow-color': 'rgba(139, 92, 246, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="ph:eye" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Eyes</h3>
                          <h4 className="min-meaning">Visi</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Penetapan Tujuan (Goals Setting)</li>
                          <li>Prioritas & Manajemen Tugas</li>
                          <li>Manajemen Waktu</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="journey-section minimal-item" data-part="neck">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#F59E0B', '--glow-color': 'rgba(245, 158, 11, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em' }}>
                            {/* Face/Jawline */}
                            <path d="M 30, 25 C 30, 42 40, 49 50, 49 C 60, 49 70, 42 70, 25" />
                            
                            {/* Left Neck Contour */}
                            <path d="M 38, 45 C 38, 58 38, 60 30, 63" />
                            
                            {/* Right Neck Contour */}
                            <path d="M 62, 45 C 62, 58 62, 60 70, 63" />
                            
                            {/* Left Shoulder */}
                            <path d="M 32, 61 C 26, 63 18, 64 12, 65" />
                            
                            {/* Right Shoulder */}
                            <path d="M 68, 61 C 74, 63 82, 64 88, 65" />
                          </svg>
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Neck</h3>
                          <h4 className="min-meaning">Adaptabilitas</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Fleksibilitas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. BODY GROUP */}
                <div className="journey-minimal-group">
                  <div className="minimal-phase-header">
                    <span className="min-phase-num">02</span>
                    <h2 className="min-phase-name">Body (Character)</h2>
                  </div>

                  <div className="journey-section minimal-item" data-part="shoulder">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#6366F1', '--glow-color': 'rgba(99, 102, 241, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="ph:user" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Shoulder</h3>
                          <h4 className="min-meaning">Tanggung Jawab & Kepemimpinan</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Inisiatif Mandiri</li>
                          <li>Leadership & Teamwork</li>
                          <li>Action Plan</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="journey-section minimal-item" data-part="heart">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#EF4444', '--glow-color': 'rgba(239, 68, 68, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="healthicons:heart-outline" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Heart</h3>
                          <h4 className="min-meaning">Manajemen Emosi</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Kecerdasan Emosional (EQ)</li>
                          <li>Pemahaman Kepribadian (MBTI & Big Five)</li>
                          <li>Introvert vs Extrovert</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="journey-section minimal-item" data-part="hand">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#10B981', '--glow-color': 'rgba(16, 185, 129, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="ph:hand-palm" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Hand</h3>
                          <h4 className="min-meaning">Pemecahan Masalah</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Kreativitas</li>
                          <li>Membantu Sesama (Helping People)</li>
                          <li>Inisiatif</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. TOE GROUP */}
                <div className="journey-minimal-group">
                  <div className="minimal-phase-header">
                    <span className="min-phase-num">03</span>
                    <h2 className="min-phase-name">Toe (Purpose)</h2>
                  </div>

                  <div className="journey-section minimal-item" data-part="leg">
                    <div className="min-dot"></div>
                    <div className="min-card-content" style={{ '--icon-accent': '#06B6D4', '--glow-color': 'rgba(6, 182, 212, 0.25)' }}>
                      <div className="min-card-header">
                        <div className="min-icon-wrapper">
                          <Icon icon="healthicons:leg-outline" />
                        </div>
                        <div className="min-title-group">
                          <h3 className="min-organ-name">Leg</h3>
                          <h4 className="min-meaning">Tujuan Hidup</h4>
                        </div>
                      </div>
                      <div className="min-desc">
                        <ul>
                          <li>Produktivitas & Manajemen Energi</li>
                          <li>Menghindari Prokrastinasi</li>
                          <li>Konsistensi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Metode */}
        <section id="classes" className="features-section">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="section-header">
              <h2 style={{ marginTop: '16px' }}>Metode<span className="font-handwriting">Pembelajaran</span></h2>
              <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: '#64748B' }}>
                Pendekatan inovatif yang menggabungkan psikologi dan kreativitas untuk pengalaman belajar yang berkesan.
              </p>
            </div>
            <div className="testimonial-grid">
              {[
                { icon: 'solar:compass-big-bold-duotone', title: 'Experiential Learning', desc: 'Belajar melalui pengalaman langsung dan refleksi mendalam, bukan sekadar teori.', color: '#488765' },
                { icon: 'solar:gamepad-old-bold-duotone', title: 'Gamification', desc: 'Integrasi sistem poin dan tantangan untuk membuat belajar terasa seperti petualangan.', color: '#EA6319' },
                { icon: 'solar:dialog-2-bold-duotone', title: 'Interactive Lecturing', desc: 'Diskusi dua arah yang memicu daya pikir kritis dan penyelesaian masalah.', color: '#3B82F6' }
              ].map((item, i) => (
                <div key={i} className="modern-service-card" style={{ '--card-theme-color': item.color }}>
                  <div className="modern-service-icon" style={{ '--icon-color': item.color, '--icon-bg': `${item.color}15` }}>
                    <Icon icon={item.icon} />
                  </div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>{item.title}</h4>
                  <p style={{ color: '#64748B', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Gallery Section with Fan Stacking Effect */}
        <section id="gallery" className="gallery-section" aria-label="Galeri Momen Transformasi PURE Education">
          <div className="gallery-header">
            <h2>Momen<span className="font-handwriting" style={{ color: '#FFFFFF' }}>Transformasi</span></h2>
            <p style={{ color: '#FFFFFF', fontSize: '1.2rem', opacity: 0.9 }}>Melihat lebih dekat proses pertumbuhan para peserta program kami.</p>
          </div>
          <div className="gallery-container">
            {[
              { img: '/assets/image/section_7_6.webp' },
              { img: '/assets/image/section_7_5.webp' },
              { img: '/assets/image/section_7_4.webp' },
              { img: '/assets/image/section_7_3.webp' },
              { img: '/assets/image/section_7_2.webp' },
              { img: '/assets/image/section_7_1.webp' }
            ].map((item, i) => (
              <div key={i} className="gallery-card">
                <img src={item.img} alt={`Momen transformasi peserta program PURE Education — Foto ${i + 1}`} loading="lazy" width={400} height={300} />
              </div>
            ))}
          </div>
        </section>

        {/* Contact Hero */}
        <section id="contact" className="features-section" style={{ background: 'white', color: 'var(--text-main)', padding: '150px 10%', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative' }}>
              <h2>Siap untuk Memulai<span className="font-handwriting">Transformasi?</span></h2>
              <p className="contact-subtitle" style={{ fontSize: '1.4rem', color: 'var(--text-muted)', maxWidth: '600px' }}>Kami siap membantu Anda membangun life skills yang diperlukan untuk menghadapi tantangan masa depan.</p>
              <div className="desktop-wa-btn" style={{ display: 'flex', gap: '24px' }}>
                <a href="https://wa.me/6287877198886" target="_blank" rel="noopener noreferrer" id="cta-whatsapp-desktop" aria-label="Hubungi PURE Education via WhatsApp" className="btn btn-blue btn-lg btn-whatsapp-shake">
                  <Icon icon="mdi:whatsapp" fontSize="1.5rem" />
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
            <div className="contact-card-premium" style={{ background: '#F8FAFC', padding: '48px', borderRadius: '24px', border: '1px solid #E2E8F0',  color: 'var(--text-main)', position: 'relative' }}>

              <h4 className="font-handwriting" style={{ fontSize: '2.2rem', color: '#EA6319', marginBottom: '32px' }}>Kontak Kami</h4>
              <div style={{ marginBottom: '32px' }}>
                <p className="contact-label" style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '8px' }}>Lokasi</p>
                <p className="contact-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>Green Lake City, Jakarta</p>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <p className="contact-label" style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '8px' }}>Telepon</p>
                <p className="contact-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>0878-7719-8886</p>
              </div>
              <div>
                <p className="contact-label" style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '8px' }}>Email</p>
                <p className="contact-value" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>info@pure-tco.com</p>
              </div>
            </div>
            
            <div className="mobile-wa-btn" style={{ display: 'none', gap: '24px', justifyContent: 'center' }}>
              <a href="https://wa.me/6287877198886" target="_blank" rel="noopener noreferrer" id="cta-whatsapp-mobile" aria-label="Hubungi PURE Education via WhatsApp" className="btn btn-blue btn-lg btn-whatsapp-shake">
                <Icon icon="mdi:whatsapp" fontSize="1.5rem" />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </section>

        <footer className="footer-main">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/assets/logo/logo-pure-edu-white.png" alt="PURE Education — Partner Edukasi Life Skills" className="footer-logo" loading="lazy" width={150} height={50} />
              <p className="footer-info">
                Membangun life skills dan potensi holistik melalui pendekatan psikologi dan kreativitas untuk masa depan yang lebih baik.
              </p>
              <div className="footer-socials">
                <a href="https://www.instagram.com/pureedu.tco/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Kunjungi Instagram PURE Education">
                  <Icon icon="mdi:instagram" />
                </a>
                <a href="https://linktr.ee/pure_tco" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Kunjungi Linktree PURE Education">
                  <Icon icon="simple-icons:linktree" />
                </a>
              </div>
            </div>
            <div className="footer-nav-group">
              <div className="footer-links">
                <a href="#about" className="footer-link">
                  Tentang <Icon icon="ph:arrow-right-bold" className="footer-link-arrow" />
                </a>
                <a href="#services" className="footer-link">
                  Layanan <Icon icon="ph:arrow-right-bold" className="footer-link-arrow" />
                </a>
                <a href="#program" className="footer-link">
                  Program <Icon icon="ph:arrow-right-bold" className="footer-link-arrow" />
                </a>
                <a href="#classes" className="footer-link">
                  Metode <Icon icon="ph:arrow-right-bold" className="footer-link-arrow" />
                </a>
                <a href="#contact" className="footer-link">
                  Kontak <Icon icon="ph:arrow-right-bold" className="footer-link-arrow" />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 PURE Education. Hak Cipta Dilindungi.</p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default App;
