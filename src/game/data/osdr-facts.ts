// Real NASA Open Science Data Repository (OSDR) studies, checked against
// https://osdr.nasa.gov/osdr/data/osd/meta/<id> on 2026-11-14. Kid-language summaries of each study's topic.
export interface OsdrFact {
  id: string;
  title: string;
  kid: string;
  topic: "plants" | "body" | "radiation";
}

export const OSDR_FACTS: OsdrFact[] = [
  {
    id: "OSD-268",
    title: "Microbiological and nutritional analysis of lettuce crops grown on the International Space Station (VEG-01B)",
    kid: "Scientists checked lettuce grown on the Space Station for germs and vitamins. It was safe to eat!",
    topic: "plants",
  },
  {
    id: "OSD-766",
    title: "The microbial communities of a tomato crop grown in Veggie under different lighting regimes on the ISS",
    kid: "Astronauts grew tomatoes in space under different colored lights. Plants need light to grow — that's why your plant room needs power.",
    topic: "plants",
  },
  {
    id: "OSD-342",
    title: "Targeting myostatin/activin A protects against skeletal muscle and bone loss during spaceflight",
    kid: "When things weigh less in space, muscles and bones get weaker. Mice on the Space Station helped scientists test ways to keep them strong.",
    topic: "body",
  },
  {
    id: "OSD-417",
    title: "Specific Host Metabolite and Gut Microbiome Alterations Are Associated with Bone-loss During Spaceflight",
    kid: "Even the tiny germs in your tummy change in space — and that might have to do with bones getting weaker.",
    topic: "body",
  },
  {
    id: "OSD-202",
    title: "Low dose (0.04 Gy) irradiation and hindlimb unloading microgravity in mice: brain transcriptomic and epigenomic data",
    kid: "Scientists studied what happens to the body when it gets space radiation AND weighs less, both at the same time.",
    topic: "radiation",
  },
  {
    id: "OSD-536",
    title: "Gene expression profiling for spaceflight induced-neuroinflammation in the mouse brain",
    kid: "Scientists looked at how going to space can make parts of the brain swell up a little — one reason we protect crews.",
    topic: "radiation",
  },
];

export const osdrUrl = (id: string) => `https://osdr.nasa.gov/bio/repo/data/studies/${id}`;
