import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="landing-page__section">
        <div className="landing-page__hero">
          <p className="landing-page__eyebrow">
            creator workflow platform
          </p>

          <h1 className="landing-page__title">
            turn ideas into
            <span className="landing-page__title-line">shipped content</span>
          </h1>

          <p className="landing-page__description">
            Studioflow helps creators organize ideas, manage production,
            schedule content, and keep their entire workflow in one place.
          </p>

          <div className="landing-page__actions">
            <Link href="/dashboard" className="landing-page__primary-action">
              Enter app
            </Link>

            <Link href="/projects" className="landing-page__secondary-action">
              View workspace
            </Link>
          </div>
        </div>

        <div className="landing-page__features">
          <div className="landing-page__feature-grid">
            <div className="landing-page__feature-card">
              <h2 className="landing-page__feature-title">capture ideas</h2>
              <p className="landing-page__feature-description">
                Keep content ideas, concepts, and notes together instead of
                scattered across apps.
              </p>
            </div>

            <div className="landing-page__feature-card">
              <h2 className="landing-page__feature-title">manage workflow</h2>
              <p className="landing-page__feature-description">
                Move projects through scripting, filming, editing, scheduling,
                and publishing.
              </p>
            </div>

            <div className="landing-page__feature-card">
              <h2 className="landing-page__feature-title">stay on schedule</h2>
              <p className="landing-page__feature-description">
                See deadlines and publish plans clearly with one organized
                creator workspace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 
