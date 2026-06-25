"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [countdownText, setCountdownText] = useState("")
  const [days, setDays] = useState("00")
  const [hours, setHours] = useState("00")
  const [minutes, setMinutes] = useState("00")
  const [seconds, setSeconds] = useState("00")

  // Enroll Redirect Handler
  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/checkout")
  }

  // Countdown timer logic matching index.html
  useEffect(() => {
    const targetDate = new Date("July 6, 2026 09:00:00").getTime()

    const updateClock = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setCountdownText("Cohort is currently starting! Get in touch immediately to join.")
        return
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24))
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((difference % (1000 * 60)) / 1000)

      setDays(d.toString().padStart(2, "0"))
      setHours(h.toString().padStart(2, "0"))
      setMinutes(m.toString().padStart(2, "0"))
      setSeconds(s.toString().padStart(2, "0"))
    }

    updateClock()
    const intervalId = setInterval(updateClock, 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Simple hash navigation emulation
  const [activeSection, setActiveSection] = useState("home")
  const navigateTo = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    setActiveSection(pageId)

    const element = document.getElementById(pageId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle inquiry form submit
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = e.currentTarget
    const nameInput = target.querySelector("#name") as HTMLInputElement
    const emailInput = target.querySelector("#email") as HTMLInputElement
    
    alert(`Thank you for reaching out, ${nameInput.value}! Your inquiry has been logged successfully. A MedAssist enrollment counselor will contact you at ${emailInput.value} shortly.`)
    target.reset()
  }

  return (
    <>
      {/* 
        Inline styling translated directly from client's index.html 
        to ensure design integrity without introducing side-effects 
      */}
      <style jsx global>{`
        :root {
          --primary: #00A3A3;
          --primary-dark: #008282;
          --primary-light: #e6f6f6;
          --dark: #0A0A0A;
          --light: #F8F9FA;
          --gray: #666666;
          --white: #FFFFFF;
          --shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
          --border-radius: 8px;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          color: var(--dark);
          background-color: var(--white);
          line-height: 1.6;
        }

        .btn {
          display: inline-block;
          background-color: var(--primary);
          color: var(--white);
          padding: 0.8rem 2rem;
          border-radius: var(--border-radius);
          font-weight: 600;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .btn:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 163, 163, 0.3);
        }

        .btn-outline {
          background-color: transparent;
          border: 2px solid var(--white);
          color: var(--white);
        }

        .btn-outline:hover {
          background-color: var(--white);
          color: var(--primary);
        }

        .page-section {
          display: none;
        }

        .page-section.active-page {
          display: block;
          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* FAQ accordion */
        .faq-item {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }
        .faq-item:hover {
          box-shadow: 0 4px 16px rgba(0,163,163,0.1);
        }
        .faq-question {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #0A0A0A;
          transition: background 0.2s ease;
        }
        .faq-question:hover {
          background-color: #f0fdfd;
        }
        .faq-question.open {
          background-color: #e6f6f6;
          color: #00A3A3;
        }
        .faq-icon {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: #00A3A3;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          transition: transform 0.3s ease;
        }
        .faq-icon.open {
          transform: rotate(45deg);
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease, padding 0.35s ease;
          padding: 0 1.5rem;
          color: #555;
          line-height: 1.7;
          font-size: 0.95rem;
        }
        .faq-answer.open {
          max-height: 400px;
          padding: 0 1.5rem 1.25rem;
        }
      `}</style>

      {/* FontAwesome integration */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="font-sans antialiased text-[#0A0A0A] bg-white min-h-screen flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-50">
          <nav className="max-w-[1200px] mx-auto flex justify-between items-center p-4 px-8">
            <a
              href="#home"
              className="text-2xl font-bold text-[#00A3A3] flex items-center gap-2"
              onClick={(e) => navigateTo(e, "home")}
            >
              <i className="fa-solid fa-user-nurse"></i> MedAssist
            </a>
            <button
              className="md:hidden text-2xl text-[#0A0A0A] focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
            <ul
              className={`${
                mobileMenuOpen ? "flex" : "hidden"
              } md:flex flex-col md:flex-row absolute md:relative top-[73px] md:top-auto left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-6 md:p-0 gap-6 md:gap-8 items-center border-b md:border-none border-gray-100`}
            >
              <li>
                <a
                  href="#home"
                  className={`font-semibold hover:text-[#00A3A3] transition-colors py-2 block ${
                    activeSection === "home" ? "text-[#00A3A3]" : "text-[#0A0A0A]"
                  }`}
                  onClick={(e) => navigateTo(e, "home")}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#program"
                  className={`font-semibold hover:text-[#00A3A3] transition-colors py-2 block ${
                    activeSection === "program" ? "text-[#00A3A3]" : "text-[#0A0A0A]"
                  }`}
                  onClick={(e) => navigateTo(e, "program")}
                >
                  Program
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className={`font-semibold hover:text-[#00A3A3] transition-colors py-2 block ${
                    activeSection === "about" ? "text-[#00A3A3]" : "text-[#0A0A0A]"
                  }`}
                  onClick={(e) => navigateTo(e, "about")}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className={`font-semibold hover:text-[#00A3A3] transition-colors py-2 block ${
                    activeSection === "faq" ? "text-[#00A3A3]" : "text-[#0A0A0A]"
                  }`}
                  onClick={(e) => navigateTo(e, "faq")}
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`font-semibold hover:text-[#00A3A3] transition-colors py-2 block ${
                    activeSection === "contact" ? "text-[#00A3A3]" : "text-[#0A0A0A]"
                  }`}
                  onClick={(e) => navigateTo(e, "contact")}
                >
                  Contact
                </a>
              </li>
              <li>
                <button
                  onClick={handleEnrollClick}
                  className="btn px-6 py-2 text-sm text-white"
                >
                  Enroll Now
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {/* Content Area */}
        <main className="flex-grow">
          {/* 1. HOME SECTION */}
          <article id="home" className={`page-section ${activeSection === "home" ? "active-page" : ""}`}>
            {/* Preload the hero background so it starts fetching immediately */}
            <link
              rel="preload"
              as="image"
              href="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1280&q=75"
            />
            <section
              className="relative text-white py-32 px-6 text-center bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(0,163,163,0.4) 100%), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1280&q=75')",
              }}
            >
              <div className="max-w-[800px] mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  Become a Certified Medical Virtual Assistant
                </h1>
                <p className="text-lg md:text-xl font-light text-gray-200">
                  Launch your global healthcare career from home. Master specialized admin workflows, client relations, and advanced telehealth infrastructure.
                </p>
                <button onClick={handleEnrollClick} className="btn text-white mt-4">
                  Enroll Now
                </button>
              </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 -mt-12 relative z-10">
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#00A3A3] text-center">
                  <i className="fa-solid fa-calendar-days text-3xl text-[#00A3A3] mb-3"></i>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Start Date</h3>
                  <p className="text-lg font-bold text-gray-800">July 06, 2026</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#00A3A3] text-center">
                  <i className="fa-solid fa-clock text-3xl text-[#00A3A3] mb-3"></i>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Duration</h3>
                  <p className="text-lg font-bold text-gray-800">6 Weeks Intensive</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#00A3A3] text-center">
                  <i className="fa-solid fa-laptop-medical text-3xl text-[#00A3A3] mb-3"></i>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Format</h3>
                  <p className="text-lg font-bold text-gray-800">100% Online / Remote</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#00A3A3] text-center">
                  <i className="fa-solid fa-wallet text-3xl text-[#00A3A3] mb-3"></i>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Investment</h3>
                  <p className="text-lg font-bold text-gray-800">Flexible Plans</p>
                </div>
              </div>
            </div>

            <section className="py-20 bg-gray-50 text-center px-6 mt-8">
              <div className="max-w-[800px] mx-auto">
                <h2 className="text-3xl font-bold text-[#0A0A0A] mb-2">Cohort Enrolling Now</h2>
                <p className="text-gray-500 mb-8">Secure your spot before registrations close.</p>

                {countdownText ? (
                  <p className="text-lg font-semibold text-[#00A3A3]">{countdownText}</p>
                ) : (
                  <div className="flex justify-center gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-md min-w-[90px]">
                      <span className="block text-3xl font-extrabold text-[#00A3A3]">{days}</span>
                      <span className="text-xs uppercase tracking-wider text-gray-400">Days</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md min-w-[90px]">
                      <span className="block text-3xl font-extrabold text-[#00A3A3]">{hours}</span>
                      <span className="text-xs uppercase tracking-wider text-gray-400">Hours</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md min-w-[90px]">
                      <span className="block text-3xl font-extrabold text-[#00A3A3]">{minutes}</span>
                      <span className="text-xs uppercase tracking-wider text-gray-400">Mins</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md min-w-[90px]">
                      <span className="block text-3xl font-extrabold text-[#00A3A3]">{seconds}</span>
                      <span className="text-xs uppercase tracking-wider text-gray-400">Secs</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-[#00A3A3] text-white py-16 px-6 text-center">
              <div className="max-w-[800px] mx-auto space-y-4">
                <h2 className="text-3xl font-bold">Ready to Transition into a Healthcare Remote Job?</h2>
                <p className="text-gray-100 max-w-[600px] mx-auto">
                  Gain high-demand medical technical skills and access directly to our operational agency ecosystem matching talent with global clients.
                </p>
                <button
                  onClick={(e) => navigateTo(e, "program")}
                  className="btn btn-outline mt-4"
                >
                  Explore Curriculum
                </button>
              </div>
            </section>
          </article>

          {/* 2. PROGRAM SECTION */}
          <article id="program" className={`page-section ${activeSection === "program" ? "active-page" : ""}`}>
            <section className="py-20 px-6 max-w-[1200px] mx-auto">
              <div className="space-y-16">
                <div>
                  <h2 className="text-3xl font-bold text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-[#00A3A3] after:rounded">
                    What You'll Gain
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="flex gap-4 p-6 bg-gray-50 rounded-xl hover:bg-[#e6f6f6] transition">
                      <i className="fa-solid fa-graduation-cap text-3xl text-[#00A3A3]"></i>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Industry Certification</h3>
                        <p className="text-gray-600 text-sm">Earn an industry-recognized credential stating your expertise as a qualified virtual care delivery professional.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gray-50 rounded-xl hover:bg-[#e6f6f6] transition">
                      <i className="fa-solid fa-briefcase text-3xl text-[#00A3A3]"></i>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Agency Placement</h3>
                        <p className="text-gray-600 text-sm">Top performing graduates receive direct matching and fast-tracked deployment workflows onto partner client rosters.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gray-50 rounded-xl hover:bg-[#e6f6f6] transition">
                      <i className="fa-solid fa-headset text-3xl text-[#00A3A3]"></i>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Practical Lab Sandbox</h3>
                        <p className="text-gray-600 text-sm">Gain practical hands-on experience handling realistic interactive environments simulating live medical support.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-[#00A3A3] after:rounded">
                    Curriculum Highlights
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
                    {[
                      {
                        num: "01",
                        title: "Medical Documentation",
                        list: ["HIPAA & Privacy compliance", "Medical Terminology mastery", "Clinical correspondence rules"],
                      },
                      {
                        num: "02",
                        title: "EMR/EHR Management",
                        list: ["Chart navigation and charting", "Data entry best practices", "System integration tools"],
                      },
                      {
                        num: "03",
                        title: "Scheduling & Invoicing",
                        list: ["Multi-provider calendars", "Appointment management", "Patient intake orchestration"],
                      },
                      {
                        num: "04",
                        title: "Insurance Verification",
                        list: ["Eligibility determination", "Pre-authorization tracks", "Payer coordination logic"],
                      },
                      {
                        num: "05",
                        title: "Live Medical Scribing",
                        list: ["Real-time encounter capture", "SOAP notes structure", "Provider-facing assistance"],
                      },
                      {
                        num: "06",
                        title: "Claims & Remote Monitoring",
                        list: ["Billing submission loops", "RPM data parsing loops", "Care coordination touchpoints"],
                      },
                    ].map((mod, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 p-6 rounded-xl relative hover:shadow-md hover:border-[#00A3A3] transition">
                        <span className="absolute top-4 right-4 text-3xl font-extrabold text-[#00A3A3]/10">{mod.num}</span>
                        <h3 className="font-bold text-lg text-[#00A3A3] mb-4 pr-8">{mod.title}</h3>
                        <ul className="list-disc pl-5 text-gray-500 text-sm space-y-1.5">
                          {mod.list.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-2xl text-center">
                  <h3 className="text-xl font-bold mb-1">Professional Graduation Credential</h3>
                  <p className="text-gray-500 text-sm mb-6">Tangible validation of your skills to display to prospective healthcare organizations internationally.</p>
                  <div className="mx-auto relative w-full max-w-[600px]" style={{ aspectRatio: "4/3" }}>
                    <Image
                      src="https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80"
                      alt="Certificate Preview"
                      fill
                      className="rounded-lg border-8 border-white shadow-md object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </section>
          </article>

          {/* 3. ABOUT SECTION */}
          <article id="about" className={`page-section ${activeSection === "about" ? "active-page" : ""}`}>
            <section className="py-20 px-6 max-w-[1200px] mx-auto">
              <div className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-8 rounded-xl border-l-6 border-[#00A3A3]">
                    <h3 className="text-xl font-bold text-[#00A3A3] flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-bullseye"></i> Our Mission
                    </h3>
                    <p className="text-gray-600">
                      To empower dedicated African healthcare administrative professionals with world-class technical and structural capabilities, bridging the divide to thriving global remote occupational ecosystems seamlessly.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-8 rounded-xl border-l-6 border-[#00A3A3]">
                    <h3 className="text-xl font-bold text-[#00A3A3] flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-eye"></i> Our Vision
                    </h3>
                    <p className="text-gray-600">
                      To stand globally recognized as the paramount catalyst center for qualified remote clinical support resources, transforming remote healthcare practice efficiency globally.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-[#00A3A3] after:rounded mb-12">
                    Meet Your Instructors
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
                    <div className="bg-white shadow-md rounded-xl overflow-hidden hover:-translate-y-1 transition text-center">
                      <div className="h-[250px] bg-gray-200 overflow-hidden relative">
                        <Image
                          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=300&q=80"
                          alt="Dr. Catherine Mwangi"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg">Dr. Catherine Mwangi</h3>
                        <div className="text-xs font-bold text-[#00A3A3] uppercase tracking-wider my-1">
                          Lead Clinical Operations
                        </div>
                        <p className="text-gray-500 text-sm mt-3">
                          Bringing over 12 years of clinical administrative workflow setup expertise across diverse tracking networks globally.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white shadow-md rounded-xl overflow-hidden hover:-translate-y-1 transition text-center">
                      <div className="h-[250px] bg-gray-200 overflow-hidden relative">
                        <Image
                          src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=300&q=80"
                          alt="Michael Chen"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg">Michael Chen, CMS</h3>
                        <div className="text-xs font-bold text-[#00A3A3] uppercase tracking-wider my-1">
                          Scribing Specialist
                        </div>
                        <p className="text-gray-500 text-sm mt-3">
                          A pioneer in remote health scribing deployments with vast expertise across EMR platform logic architectures.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </article>

          {/* 4. FAQ SECTION */}
          <article id="faq" className={`page-section ${activeSection === "faq" ? "active-page" : ""}`}>
            <section className="py-20 px-6 max-w-[860px] mx-auto">
              <h2 className="text-3xl font-bold text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-[#00A3A3] after:rounded mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-center text-gray-500 mb-12 text-base">
                Everything you need to know before taking the leap into your medical VA career.
              </p>

              <div className="space-y-3">
                {([
                  {
                    q: "What is this programme about?",
                    a: "This is a 6-week live online training programme designed to equip you with real, job-ready skills to work as a Medical Virtual Assistant (MVA) for US-based healthcare providers from anywhere in the world."
                  },
                  {
                    q: "Who is this course for?",
                    a: "This course is open to anyone interested in breaking into the healthcare virtual assistance space, including medical and nursing students, recent graduates, working professionals looking to pivot into remote healthcare work, and anyone ready to build a marketable skill set in the medical industry."
                  },
                  {
                    q: "Do I need a medical background to enrol?",
                    a: "No. A medical background is helpful but not required. What matters most is your willingness to learn, show up consistently, and commit to the 6 weeks. The programme is structured to take you from foundational knowledge to job-ready skills."
                  },
                  {
                    q: "How long is the course?",
                    a: "The course runs for 6 weeks, from 15 August 2026 to 20 September 2026, with a closing ceremony on 27 September 2026."
                  },
                  {
                    q: "When are the classes held?",
                    a: "Classes are held every Saturday and Sunday from 7:00 PM to 8:00 PM (EAT)."
                  },
                  {
                    q: "Which platform will be used?",
                    a: "All sessions are conducted live online via Zoom. You will receive your Zoom link and joining instructions upon registration and payment."
                  },
                  {
                    q: "What topics will be covered?",
                    a: "The 6-week curriculum covers:\n\n• Week 1: Orientation & Clinical Documentation Overview · SOAP, DAP, Referral & Discharge Notes\n• Week 2: EMR/EHR Systems · Patient Scheduling & Communication\n• Week 3: Insurance Verification (VOB) · Eligibility Checks & DrChrono Workflow\n• Week 4: Medical Scribing · Assessment, Plan & Documentation · Remote Patient Monitoring (RPM)\n• Week 5: Prior Authorizations with CoverMyMeds · Claims Submission & DrChrono Billing\n• Week 6: AR & Denial Management · Capstone Review & Portfolio Building"
                  },
                  {
                    q: "What will I walk away with?",
                    a: "Upon successful completion you will receive a certificate of completion and a professional portfolio of real work samples that you can immediately use when applying for Medical VA roles on platforms like Upwork and other freelancing or job platforms."
                  },
                  {
                    q: "How much does the course cost?",
                    a: "The course fee is KES 8,000 for the full 6-week programme. Payment plans are available; reach out to us before registering to discuss options."
                  },
                  {
                    q: "How do I register and pay?",
                    a: "Registration is done online. You will fill in your details and pay via M-Pesa. Upon successful payment, you will receive access to our official Cohort 1 WhatsApp group where all communication, resources, and Zoom links will be shared."
                  },
                  {
                    q: "Are there assessments?",
                    a: "Yes. You will complete assignments during the course to reinforce your learning and build your portfolio. Assignments are reviewed and feedback is provided. Assignments are what build the work samples and portfolio."
                  },
                  {
                    q: "What are the requirements to receive a certificate?",
                    a: "To qualify for a certificate of completion, you must: (1) Attend a minimum of 80% of all sessions, and (2) Complete and submit all required assignments."
                  },
                  {
                    q: "What happens if I miss a class?",
                    a: "You may continue with the course, there will be recordings for the same. We encourage all participants to prioritize attendance as sessions are live and interactive."
                  },
                  {
                    q: "Is the course interactive?",
                    a: "Absolutely. Sessions include live demonstrations, guided practical exercises, real case studies, class discussions, and direct interaction with instructors. This is not a passive, watch-and-listen course; you will be actively working."
                  },
                  {
                    q: "Will there be a WhatsApp group?",
                    a: "Yes. All registered and paid participants will be added to the official MedAssist Academy Cohort 1 WhatsApp group. This is where you will receive Zoom links, announcements, assignments, resources, and instructor support."
                  },
                  {
                    q: "Can I join classes on my phone?",
                    a: "Yes. You can join via smartphone, tablet, laptop, or desktop as long as you have a stable internet connection and the Zoom app installed."
                  },
                  {
                    q: "Does completing this course guarantee me a job?",
                    a: "While we do not guarantee employment, our programme is specifically designed to make you job-ready. You will graduate with a certificate, a real portfolio, and the practical skills that clients on platforms like Upwork actively look for in a Medical VA."
                  },
                  {
                    q: "I have more questions how do I reach you?",
                    a: "You can reach us via WhatsApp or DM on our social media pages. We are happy to answer any questions before or after registration."
                  },
                ] as { q: string; a: string }[]).map((item, idx) => (
                  <div key={idx} className="faq-item">
                    <button
                      className={`faq-question ${openFaq === idx ? "open" : ""}`}
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                    >
                      <span>{item.q}</span>
                      <span className={`faq-icon ${openFaq === idx ? "open" : ""}`}>+</span>
                    </button>
                    <div className={`faq-answer ${openFaq === idx ? "open" : ""}`}>
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-[#e6f6f6] rounded-xl p-8 text-center">
                <i className="fa-solid fa-circle-question text-4xl text-[#00A3A3] mb-3"></i>
                <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                <p className="text-gray-500 mb-5 text-sm">Our admissions team is happy to walk you through anything not covered above.</p>
                <button onClick={(e) => navigateTo(e as unknown as React.MouseEvent, "contact")} className="btn text-white">
                  Contact Us
                </button>
              </div>
            </section>
          </article>

          {/* 5. CONTACT SECTION */}
          <article id="contact" className={`page-section ${activeSection === "contact" ? "active-page" : ""}`}>
            <section className="py-20 px-6 max-w-[1200px] mx-auto">
              <h2 className="text-3xl font-bold text-center relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-[#00A3A3] after:rounded mb-12">
                Get In Touch
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Start Your Journey Today</h3>
                  <p className="text-gray-500">
                    Have questions about the enrollment roadmap, tuition structures, or long-term alignment prospects? Reach out directly.
                  </p>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-phone text-lg text-[#00A3A3] w-8"></i>
                      <a href="tel:0143869393" className="hover:text-[#00A3A3] transition-colors">0143869393</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-envelope text-lg text-[#00A3A3] w-8"></i>
                      <a href="mailto:medassistacademy@gmail.com" className="hover:text-[#00A3A3] transition-colors">
                        medassistacademy@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="pt-4">
                    <a
                      href="https://www.linkedin.com/company/medva-assist-academy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0077B5] text-white px-6 py-2.5 rounded-lg hover:bg-[#005582] transition"
                    >
                      <i className="fa-brands fa-linkedin text-lg"></i> Connect on LinkedIn
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        placeholder="Jane Doe"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A3A3] transition bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        placeholder="jane@example.com"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A3A3] transition bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold mb-2">
                        Message / Inquiry Details
                      </label>
                      <textarea
                        id="message"
                        required
                        placeholder="Tell us about your background and interest..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A3A3] transition bg-white resize-none"
                      ></textarea>
                    </div>
                    <button type="submit" className="btn w-full text-white">
                      Submit Inquiry
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </article>
        </main>

        {/* Footer */}
        <footer className="bg-[#0A0A0A] text-white py-12 px-6 text-center border-t-3 border-[#00A3A3]">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="text-xl font-bold text-white">MedAssist Academy & Agency</div>
            <ul className="flex justify-center gap-6 text-sm text-gray-400">
              <li>
                <a href="#home" onClick={(e) => navigateTo(e, "home")} className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#program" onClick={(e) => navigateTo(e, "program")} className="hover:text-white transition">
                  Program Details
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => navigateTo(e, "about")} className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => navigateTo(e, "faq")} className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => navigateTo(e, "contact")} className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
            <p className="text-xs text-gray-600">&copy; 2026 MedAssist Academy & Agency. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
