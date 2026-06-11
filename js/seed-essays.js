// Seed corpus: short essays on the redistribution of wealth, written from
// deliberately distinct perspectives so that clusters emerge in embedding
// space. The "Generate corpus" button can replace these with LLM output.

export const TOPIC = "redistribution of wealth";

// Loose ideological groupings, used only for point colors on the map.
export const GROUPS = {
  market: { label: "Market-first", color: "#e06c75" },
  egalitarian: { label: "Egalitarian", color: "#61afef" },
  pragmatic: { label: "Pragmatic / centrist", color: "#98c379" },
  moral: { label: "Moral / spiritual", color: "#c678dd" },
  lived: { label: "Lived experience", color: "#56b6c2" },
  heterodox: { label: "Heterodox", color: "#d19a66" },
};

export const SEED_ESSAYS = [
  {
    id: "libertarian-economist",
    perspective: "Libertarian economist",
    group: "market",
    text: `Redistribution begins from a mistaken premise: that wealth exists as a fixed pool to be divided rather than a stream that must be continuously created. When the state taxes productive activity to transfer income, it weakens the very incentives that generate prosperity in the first place. Every dollar redistributed passes through a bureaucracy that consumes part of it and misallocates much of the rest. The historical record is clear: societies that protect property rights, enforce contracts, and let prices coordinate behavior grow rich; societies that try to engineer equal outcomes stagnate. Compassion is better expressed through voluntary charity and through removing barriers — occupational licensing, zoning, tariffs — that keep the poor from competing. The question is not whether we care about the least well-off. It is whether coercive transfers actually help them, and the evidence suggests that growth, not redistribution, is what has lifted billions out of poverty.`,
  },
  {
    id: "democratic-socialist",
    perspective: "Democratic socialist",
    group: "egalitarian",
    text: `Extreme wealth is not a reward for extreme contribution; it is a sign that the rules of the economy have been written by those who already hold power. No one earns a billion dollars — they extract it, from underpaid labor, from monopoly position, from publicly funded research privatized at the moment it becomes profitable. Redistribution is not charity. It is a partial return of what was collectively produced. A democratic society cannot survive alongside concentrations of wealth large enough to buy its legislatures, its media, and its courts. We should tax great fortunes steeply, fund universal healthcare, housing, and education, and give workers ownership stakes in the firms their labor sustains. The fear that this kills innovation is propaganda: most innovators are motivated by curiosity and modest security, not the prospect of dynastic wealth. The choice is between an economy run for the many or hoarded by the few.`,
  },
  {
    id: "centrist-wonk",
    perspective: "Centrist policy analyst",
    group: "pragmatic",
    text: `The redistribution debate is usually conducted between two cartoons: the heartless market fundamentalist and the naive leveler. Actual policy lives in the details. The empirical literature suggests moderate redistribution — an earned income tax credit, child allowances, progressive consumption taxes — can reduce poverty substantially with minimal effects on growth, while badly designed transfers create poverty traps through steep benefit cliffs. Marginal tax rates matter, but so does what the revenue buys: high-quality early education has a far better return than poorly targeted subsidies. The most defensible position is unglamorous: redistribute enough to guarantee a decent floor, design programs to preserve work incentives, evaluate them ruthlessly, and resist both the urge to soak the rich for symbolism and the pretense that markets alone will look after the unlucky. Good redistribution is plumbing, not poetry.`,
  },
  {
    id: "christian-ethicist",
    perspective: "Christian ethicist",
    group: "moral",
    text: `Scripture is uncomfortably blunt about wealth. The manna in the desert spoiled when hoarded; the jubilee returned land to the dispossessed every fifty years; the early church held possessions in common, and Christ told the rich young ruler to sell all he had. Christian ethics does not treat property as an absolute right but as stewardship — all things belong to God, and we hold them in trust for one another. From this view, the question is not whether redistribution is permissible but whether our current arrangements are defensible: children hungry in nations of plenty, workers unable to afford the goods they produce. The state is a blunt instrument, and charity given freely has a grace that taxation lacks. But when voluntary generosity fails to meet the scale of need, justice — not mere mercy — demands structural remedy. A society is judged by how it treats the least of these.`,
  },
  {
    id: "utilitarian-ea",
    perspective: "Utilitarian / effective altruist",
    group: "moral",
    text: `The argument for redistribution is, at bottom, arithmetic. A dollar produces far more wellbeing in the hands of someone earning two dollars a day than in the portfolio of a millionaire — the diminishing marginal utility of money is one of the most robust findings in economics. Transferring resources from the rich to the poor therefore increases total welfare, provided the transfer doesn't destroy too much value in transit. The interesting questions are about that proviso: incentive effects, administrative losses, and where the recipients are. A globally consistent utilitarian must notice that the world's poorest live mostly outside rich countries, so the highest-impact redistribution is often international — direct cash transfers, malaria prevention, deworming — rather than domestic. Borders are morally arbitrary. If you would tax a billionaire to feed a hungry child in your own city, consistency suggests you should be at least as willing when the child is in Malawi.`,
  },
  {
    id: "rawlsian",
    perspective: "Rawlsian philosopher",
    group: "egalitarian",
    text: `Imagine designing society from behind a veil of ignorance, not knowing whether you will be born talented or disabled, to wealthy parents or poor ones. No rational person in that position would choose our current distribution, because no one would gamble their entire life on landing in the top decile. Rawls's difference principle follows: inequalities are justifiable only insofar as they improve the position of the least advantaged. Some inequality passes this test — rewards that genuinely elicit effort and innovation benefiting everyone. Much of it does not. Inherited wealth, rents from ownership, returns to mere luck: these cannot be defended to the person at the bottom, and justification to every member of society is what legitimacy means. Redistribution, on this view, is not the state taking what is privately owned; it is the ongoing correction of a basic structure that would otherwise convert natural and social lotteries into permanent castes.`,
  },
  {
    id: "burkean-conservative",
    perspective: "Burkean conservative",
    group: "market",
    text: `The redistributionist impulse mistakes society for a machine that can be disassembled and rebuilt around an abstraction called equality. But a society is more like an old forest than an engine: an inheritance of institutions, habits, and obligations grown over generations, easily destroyed and slow to regrow. Property is one of those institutions. It anchors families, funds the little platoons of civil society, and gives people a stake in the future beyond their own lives. Confiscatory taxation severs that link, replacing the dense web of local obligation with a thin, brittle dependence on the central state. This is not a defense of plutocracy — the conservative tradition has always insisted that wealth carries duties, and a gentleman who neglects his community deserves shame. But duties enforced by custom and conscience preserve freedom; duties enforced by the tax collector eventually consume it. Reform should be slow, local, and humble.`,
  },
  {
    id: "marxist-historian",
    perspective: "Marxist historian",
    group: "egalitarian",
    text: `To debate "redistribution" is already to concede the crucial point, for it accepts the prior distribution as a baseline rather than asking how it arose. Historically, the answer is not subtle: enclosure of common lands, colonial extraction, slavery, and the legal construction of the corporation created the original accumulations that capital has compounded since. The wage relation itself is the engine of ongoing transfer — the worker produces more value than she is paid, and the difference accrues to owners as profit. From this vantage, welfare-state redistribution is capitalism's pressure valve: it returns a fraction of the surplus to keep the system legitimate, expanding when labor is militant and contracting when it is weak, as the neoliberal decades demonstrated. The real question is not how much to redistribute after production but who owns the means of production and who governs the workplace. Everything else is negotiation over the size of the leash.`,
  },
  {
    id: "small-business-owner",
    perspective: "Small business owner",
    group: "lived",
    text: `I run a restaurant with eleven employees, and I'll tell you what the redistribution debate looks like from behind the counter. I'm not rich. Most years I take home less than my chef after I've covered payroll, rent, insurance, and the loan I personally guaranteed. When politicians talk about taxing "the wealthy," the brackets they write somehow always reach me before they reach the hedge fund managers, who have lawyers to relocate their income. I pay half my employees' payroll taxes, their unemployment insurance, and rising health premiums, and I genuinely want my people to live decently — I raised wages before the law made me. But every mandate is designed by someone who has never made payroll, and the cumulative weight lands on businesses too small to dodge it. If you want to redistribute something, redistribute the loopholes. Make the giants pay what I already pay, and leave the corner store alone.`,
  },
  {
    id: "hedge-fund-manager",
    perspective: "Hedge fund manager",
    group: "market",
    text: `Let me say the unfashionable thing: the system that made me rich mostly works, and the parts that don't are not the parts critics attack. Markets allocate capital from people who have it to people who can use it, and prices do this better than any committee. My returns come from being right about the future more often than I'm wrong, and the pension funds that invest with me — teachers, firefighters — share those returns. That said, I'll concede what many colleagues won't: carried interest is an indefensible loophole, inheritance on the scale we now permit is a lottery not a meritocracy, and a society where my marginal tax rate is lower than my assistant's has misconfigured something. I'd trade higher, simpler taxes on people like me for an end to the regulatory theater that mostly protects incumbents. Tax wealth lightly and consistently rather than income punitively, fund mobility — schools, not subsidies — and let competition do the redistributing.`,
  },
  {
    id: "single-mother",
    perspective: "Single mother working two jobs",
    group: "lived",
    text: `People who debate redistribution in the abstract have never sat at my kitchen table at midnight with a calculator and a stack of bills, deciding whether the electric bill or the car insurance gets paid this month, because the car gets me to both jobs and the lights keep my kids able to do homework. I work sixty hours a week. Nobody can tell me I lack work ethic. And still, one ER visit wiped out two years of saving. When I finally got a raise, I lost the childcare subsidy, and the math left me poorer for earning more — explain to me how that's an incentive. I don't want a handout; I want the floor to stop moving. School lunches, childcare, healthcare that doesn't bankrupt you: that's not someone else's money being given to me, it's the country deciding that children shouldn't pay for the bad luck of being born to tired parents. The people with the least are the ones lectured most about responsibility.`,
  },
  {
    id: "retired-teacher",
    perspective: "Retired public school teacher",
    group: "lived",
    text: `Thirty-four years in a classroom teaches you that the redistribution debate starts in the wrong place. By the time my students reached me, the distribution had already happened — in prenatal care, in lead paint, in whether anyone read to them, in whether the school's roof leaked. I taught in a district where the textbooks were older than the students, twenty minutes from one where every child had a laptop. Both schools were funded by property taxes, which is to say: by the accident of what the neighborhood was worth. We don't need to confiscate fortunes to be a decent country. We need to stop pretending children compete on a level field when some start the race at the finish line. My pension, which politicians call a luxury, was deferred salary I bargained for instead of raises. Fund schools by need rather than zip code, pay for nurses and counselors, and most of the inequality everyone wrings their hands about will shrink within a generation.`,
  },
  {
    id: "georgist",
    perspective: "Georgist",
    group: "heterodox",
    text: `Both sides of the redistribution debate miss the distinction that matters: between wealth that is created and wealth that is captured. A founder who builds a useful product creates value; a landowner whose lot quadruples in price because the city built a subway station nearby has created nothing — the community created that value, and he merely collected it. Henry George saw this in 1879: rent from land and natural resources is the great unearned income, and taxing it distorts nothing, because the land doesn't go anywhere. Tax land values fully, abolish taxes on wages and productive investment, and distribute the surplus as a citizen's dividend. You get the dynamism that conservatives prize and the equity that progressives demand, without punishing work or savings. Our housing crisis, our wealth gap, and our sprawl are all symptoms of the same untaxed privilege. It is the rare radical idea endorsed by Milton Friedman and socialists alike — which is perhaps why no one with property on the line lets it near a ballot.`,
  },
  {
    id: "behavioral-economist",
    perspective: "Behavioral economist",
    group: "pragmatic",
    text: `The redistribution debate assumes a creature — the rational actor who responds smoothly to incentives — that decades of experiments have failed to find. Real people anchor, satisfice, and care intensely about fairness: subjects in ultimatum games burn their own money to punish greedy splits, and workers' productivity drops when they learn of arbitrary pay gaps, even when their own pay is unchanged. Inequality, in other words, is not just a moral question; it is a measurable input to motivation, health, and trust. Scarcity itself taxes cognition — the poor make worse decisions not because they are worse people but because poverty consumes the mental bandwidth that planning requires, a finding that inverts the usual causality story. This reframes policy design: cash transfers work better than in-kind paternalism in most cases; benefit cliffs are psychologically catastrophic, not just fiscally inefficient; and the framing of a program as earned insurance versus charity changes both uptake and stigma. Redistribute, but design for humans, not for the textbook.`,
  },
  {
    id: "ancap",
    perspective: "Anarcho-capitalist",
    group: "market",
    text: `Taxation is not a membership fee, a social contract, or a shared sacrifice. It is the taking of property under threat of imprisonment, and no vote can transform that act into something other than what it is. If your neighbor demanded a third of your income to fund causes he considered worthy, you would call it robbery; electing representatives to do the demanding launders the transaction without changing its nature. I did not sign the social contract, and a contract one cannot decline is not a contract. The honest case against redistribution is not that it is inefficient — though it is — but that it is built on coercion all the way down. Mutual aid societies, friendly societies, and fraternal lodges insured millions of workers before the welfare state crowded them out; voluntary institutions can and did provide what statists insist only force can. A society wealthy enough to fund a vast redistributive bureaucracy is wealthy enough to care for its poor without one. Charity at gunpoint is not virtue.`,
  },
  {
    id: "nordic-social-democrat",
    perspective: "Nordic social democrat",
    group: "egalitarian",
    text: `In my country we conducted the experiment the rest of the world keeps debating, and the results are in. High taxes — including, yes, on the middle class — fund universal childcare, education through university, healthcare, and generous parental leave. The predicted collapse never came: we rank among the most innovative and entrepreneurial economies on earth, partly because failure here doesn't mean ruin. A founder whose startup dies still has healthcare; a worker whose industry vanishes is retrained, not discarded. We call it flexicurity — fierce market competition atop an unconditional floor. What outsiders miss is that universalism, not generosity, is the secret. Programs for the poor become poor programs; programs for everyone create middle-class constituencies that defend their quality forever. The doctor and the cleaner sit in the same waiting room, so the waiting room stays decent. Redistribution here is not a wound the rich endure but the infrastructure of a society where trust is high because no one is desperate.`,
  },
  {
    id: "development-economist",
    perspective: "Development economist (Global South)",
    group: "pragmatic",
    text: `The redistribution debate in rich countries has a parochialism it rarely notices: the marginal welfare recipient in Stockholm or Ohio is, globally speaking, well-off. The deepest inequality is not within nations but between them, and it was not produced by differences in effort. Colonial extraction built the railways of Europe with the minerals and labor of the colonized; today's trade rules, intellectual property regimes, and debt structures continue quieter versions of the same transfer — more capital flows from poor countries to rich ones, through profit repatriation and debt service, than arrives as aid. So when wealthy nations debate their internal top tax rate while enforcing patent monopolies on medicines and subsidizing their own farmers into dumping crops on African markets, the conversation is incomplete. Effective global redistribution looks less like charity and more like rule changes: technology transfer, debt cancellation, fair commodity pricing, and freedom of movement. The poorest billion don't need rich countries' generosity so much as the end of arrangements that require their poverty.`,
  },
  {
    id: "tech-ubi",
    perspective: "Tech entrepreneur, UBI advocate",
    group: "heterodox",
    text: `I've built companies that automate work, so let me be direct about where this goes: the link between labor and income, the foundation of every existing welfare system, is dissolving. Software already does what clerks, drafters, and analysts did; machine learning is coming for diagnosis, drafting, and driving. You cannot retrain your way out of a future where capital does the working, because the returns flow to whoever owns the algorithms. The answer isn't to smash the machines or to means-test ever-shrinking benefits with ever-growing bureaucracies. It's a universal basic income: a dividend on the collective inheritance of human knowledge that makes all this automation possible. Nobody invented the transistor alone. UBI is not socialism — markets keep allocating, entrepreneurs keep building, and people keep working, as every pilot from Stockton to Kenya shows — it is capitalism with a floor instead of a trapdoor. Fund it with taxes on the automation dividend itself. The alternative is a feudalism of platform owners and everyone else.`,
  },
  {
    id: "union-organizer",
    perspective: "Labor union organizer",
    group: "egalitarian",
    text: `Everyone wants to talk about redistribution after the fact — taxes, transfers, programs. I want to talk about distribution at the source: who has power when the value gets divided in the first place. For thirty years, productivity climbed while paychecks flatlined, and that gap didn't happen by physics. It happened because we gutted the one institution that ever gave workers leverage at the table. When union density was a third of the workforce, a high school graduate could buy a house and a boat; the weekend, the eight-hour day, employer healthcare — none of it was given, all of it was won. The decline wasn't natural either: it was engineered through right-to-work laws, captive-audience meetings, and consultants paid millions to crush organizing drives. A tax credit is something done for you that can be undone next election. A contract is something you won that they have to take from you. Rebuild bargaining power and redistribution mostly takes care of itself — workers don't need the state's check when they can win their own raise.`,
  },
  {
    id: "buddhist-teacher",
    perspective: "Buddhist teacher",
    group: "moral",
    text: `Before asking how wealth should be distributed, sit for a moment with the craving that drives its accumulation. The Buddha did not condemn wealth — he counseled lay followers to earn honestly and to divide their income among needs, savings, and generosity — but he saw clearly that grasping is suffering, for the holder as much as the deprived. A billionaire anxious about his ranking and a laborer anxious about his rent share the same affliction at different doses. From this view, redistribution debates often miss the deeper economy: both the hoarding of the rich and the resentment of the poor bind their holders to dissatisfaction. This is not quietism. Interdependence is the heart of the teaching — no fortune was ever assembled alone, no self exists apart from the labor and care of countless others, and a society that organizes itself around private accumulation has mistaken a delusion for a foundation. Generosity, dana, is the first perfection not because giving is nice but because it loosens the fist. Structure matters; so does the heart that builds the structure.`,
  },
  {
    id: "evolutionary-psychologist",
    perspective: "Evolutionary psychologist",
    group: "heterodox",
    text: `Our intuitions about redistribution were calibrated on the Pleistocene savanna, and the mismatch explains much of the modern debate's heat. Hunter-gatherer bands shared meat widely — a successful hunt was luck-heavy, so sharing was insurance — but gathered foods, more effort-based, were shared less. We are descended from creatures exquisitely tuned to distinguish luck from laziness, to punish free riders, and to resent dominant individuals who hoard. Watch any policy argument and you'll see these ancient modules firing: support for transfers tracks perceived deservingness almost perfectly, which is why 'welfare queen' narratives are so politically potent and why disaster relief is uncontroversial. The trouble is scale. Mechanisms built for bands of 150, where everyone's effort was visible, misfire in anonymous societies of millions, where neither the rich nor the poor can be directly observed. Neither markets nor states are natural; both are tools. Policy that ignores the evolved psychology of fairness — that insists people stop caring about reciprocity — will generate backlash no matter how elegant its economics.`,
  },
  {
    id: "constitutional-originalist",
    perspective: "Constitutional originalist",
    group: "market",
    text: `Whatever one thinks of redistribution as policy, the prior question for an American is constitutional: where is the power? The federal government is one of enumerated powers, and the Founders — who had just fought a war over confiscatory taxation — built a structure deliberately hostile to schemes of leveling. Madison wrote in Federalist 10 that the protection of the unequal faculties of acquiring property is the first object of government. The takings clause requires compensation when property is appropriated; the original Constitution prohibited direct taxes unapportioned among the states, a barrier the Sixteenth Amendment only partially removed. The modern transfer state was built not on constitutional text but on a Depression-era reinterpretation of the general welfare and commerce clauses that the Founders would not recognize. If the people wish to authorize broad redistribution, the Constitution provides a mechanism: Article V amendment. What corrodes the republic is achieving it instead through judicial creativity, because a government loosed from its charter for benevolent ends remains loosed from it for all others.`,
  },
  {
    id: "ecological-economist",
    perspective: "Ecological economist",
    group: "heterodox",
    text: `The standard answer to inequality — grow the pie so everyone's slice expands — quietly assumes an infinite oven. But the economy is a subsystem of a finite biosphere, already overshooting planetary boundaries in carbon, nitrogen, and biodiversity. Growth can no longer be the universal solvent that dissolves distributional conflict, and that changes the politics of redistribution entirely. On a finite planet, the question stops being abstract: the carbon budget consumed by the wealthiest one percent — whose emissions exceed those of the poorest half of humanity — is budget unavailable to people still lacking electricity. Luxury consumption is not merely unequal; it is appropriation of a shared and shrinking commons. Redistribution therefore becomes an ecological necessity, not just a moral preference: cap resource throughput, tax carbon and land heavily, shorten the working week to share the remaining labor, and guarantee public luxury — transit, parks, libraries, healthcare — in place of private excess. A steady-state economy without redistribution is a caste system. With it, sufficiency for all is still possible.`,
  },
  {
    id: "pragmatic-mayor",
    perspective: "Big-city mayor",
    group: "pragmatic",
    text: `I govern a city where a tech campus and a homeless encampment share a streetlight, so the redistribution debate isn't theoretical for me — it's Tuesday. Here is what the think-pieces miss: I can't print money, my budget must balance, and my tax base has wheels. When we raised local business taxes, three employers moved eleven miles to the suburbs and took their payroll with them; the poor stayed, and so did the bill for serving them. National pundits call that a myth until they sit in my chair. So I've learned to redistribute sideways: zoning reform that lets builders add housing — the single most redistributive thing a city can do — community college pipelines into hospital and trade jobs, libraries and buses and parks that function as a shared standard of living. I'll take federal money with strings over local symbolism that empties downtown. My constituents don't ask whether a program is socialism or capitalism. They ask whether the bus came, whether the rent is survivable, whether their kid's school is safe. Ideology is a luxury of people who don't have to fix potholes.`,
  },
];
