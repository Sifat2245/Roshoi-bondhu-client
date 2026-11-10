import React from "react";
import pasta from "../../../assets/recipe-28-550x690.jpg";
import potatoWedges from "../../../assets/recipe-8-550x690.jpg";
import "./LoginHero.css";

const communityFeatures = [
  {
    title: "Find your next favourite",
    description: "Everyday meals, family classics, and something new to try.",
  },
  {
    title: "Share a little of home",
    description: "Give your recipes, kitchen stories, and little tips a home.",
  },
  {
    title: "Meet your food people",
    description: "Join cooking groups and connect over a shared love of food.",
  },
];

export const LoginHero: React.FC = () => {
  return (
    <section className="login-hero w-full" aria-labelledby="login-hero-heading">
      <div className="login-hero-intro">
        <h1 id="login-hero-heading">
          Good food tastes
          <br />
          <span>better together.</span>
        </h1>
        <p className="login-hero-description">
          From your family’s favourite recipe to tonight’s kitchen experiment —
          there’s a seat for every home cook at Heshel.
        </p>
      </div>

      <div className="login-hero-details">
        <div
          className="login-hero-showcase"
          role="group"
          aria-label="A preview of the recipes and conversations you can share"
        >
          <div className="login-hero-showcase-heading">
            <span>A taste of your next feed</span>
            <span className="login-hero-preview-label">Recipe inspiration</span>
          </div>

          <div className="login-hero-collage">
            <article className="login-hero-recipe">
              <div className="login-hero-recipe-photo">
                <img
                  src={pasta}
                  alt="A bowl of prawn pasta with colourful vegetables"
                  width={550}
                  height={690}
                  fetchPriority="high"
                />
                <span className="login-hero-photo-tag">
                  A little comfort in a bowl
                </span>
              </div>
              <div className="login-hero-recipe-caption">
                <div>
                  <span className="login-hero-recipe-category">
                    FROM A HOME KITCHEN
                  </span>
                  <h2>Prawn & veggie pasta</h2>
                </div>
              </div>
            </article>

            <figure className="login-hero-side-recipe">
              <img
                src={potatoWedges}
                alt="Golden herb-coated potato wedges on a black plate"
                width={550}
                height={690}
              />
              <figcaption>
                <span>Made for sharing</span>
                <strong>Crispy potato wedges</strong>
              </figcaption>
            </figure>

            <div className="login-hero-conversation">
              <div>
                <p>Every recipe starts a conversation.</p>
                <span>Swap a tip. Share a memory.</span>
              </div>
            </div>

            <span className="login-hero-handwritten" aria-hidden="true">
              Your kitchen,
              <br />
              your kind of people.
            </span>
          </div>
        </div>

        <ul
          className="login-hero-features"
          aria-label="What you can do on Heshel"
        >
          {communityFeatures.map(({ title, description }) => (
            <li key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </li>
          ))}
        </ul>

        <p className="login-hero-signoff">
          <span lang="bn">রান্নার গল্পে, একসাথে।</span>
          <span className="login-hero-signoff-dot" aria-hidden="true">
            ·
          </span>
          <span>Good food. Shared stories.</span>
        </p>
      </div>
    </section>
  );
};

export default LoginHero;
