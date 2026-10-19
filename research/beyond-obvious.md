# Beyond the Obvious — research notes

All listed pages were searched for and then fetched in full (or fetched for the relevant sections). These notes capture the specific evidence used in the ten articles; claims in the articles are paraphrased rather than quoted.

1. **Monty Hall — University of Illinois Data Science Discovery, “The Monty Hall Problem”**  
   URL: https://discovery.cs.illinois.edu/learn/Prediction-and-Probability/The-Monty-Hall-Problem/  
   Explains the standard setup: the contestant chooses among three doors, and a knowledgeable host opens an unchosen losing door. Staying wins with probability 1/3; switching wins with probability 2/3. The host’s informed reveal matters to the result.

2. **Birthday problem — Harvey Mudd College Math Fun Facts, “Birthday Problem”**  
   URL: https://math.hmc.edu/funfacts/birthday-problem/  
   Gives the complementary-product method for the no-match probability: for each new person, multiply by the chance their birthday avoids all previous birthdays. With 23 people and 365 equally likely dates (leap day excluded), the exact no-match probability is about 49.3%, so the collision probability is about 50.7%. The article separately searched and fetched Scientific American / Science Buddies’ “Using Probability to Understand the Birthday Paradox” (https://www.scientificamerican.com/article/bring-science-home-probability-birthday-paradox/); although its headline conclusion of roughly 50% is sound, its detailed calculation treats 253 pairwise comparisons as independent, which they are not, and reports an inaccurate 50.05% figure. The article uses the sequential-product result instead.

3. **Simpson’s paradox — Stanford Best Practices in Science, “Questionable Methods | Simpson’s Paradox”**  
   URL: https://bps.stanford.edu/home/statistical-forensics/statistical-forensics-questionable-methods/questionable-methods-simpsons  
   Defines the reversal between marginal (pooled) and partial (stratified) associations and illustrates how hospital outcomes can reverse after combining patient severity groups. Notes the risk of causal inference from observational comparisons.

4. **Benford’s law — R. M. Fewster, “A Simple Explanation of Benford’s Law,” hosted by Williams College Mathematics**  
   URL: https://web.williams.edu/Mathematics/sjmiller/public_html/ntprob19/handouts/benford/Fewster_SimpleExplanationBenfordLaw.pdf  
   States the leading-digit probability as log10((d+1)/d), giving about 30.1% for 1 and 4.6% for 9. Describes the approximate conditions: reasonably smooth data spanning several orders of magnitude; the paper also shows a dataset with insufficient range need not fit well.

5. **Regression to the mean — University of Virginia Library StatLab, “Regression to the Mean and Change Score Analysis”**  
   URL: https://library.virginia.edu/data/articles/regression-mean-and-change-score-analysis  
   Explains that an extreme baseline measurement can be followed by a more typical measurement due to variation alone, potentially misattributed to an intervention. Recommends control/comparison groups and other study-design safeguards.

6. **Base-rate neglect — Communications of the ACM, “Mitigating the Base-Rate Neglect Cognitive Bias in Data Science Education” (authors affiliated with Technion’s Department of Education in Science and Technology)**  
   URL: https://cacm.acm.org/blogcacm/mitigating-the-base-rate-neglect-cognitive-bias-in-data-science-education/  
   Gives the frequency example: prevalence 1 per 1,000, 100% true-positive detection, and 5% false-positive rate among healthy people. That yields 1 true positive and about 50 false positives per 1,000 people; among about 51 positives, 1/51 (roughly 2%) are true cases. Article keeps this explicitly hypothetical.

7. **Gambler’s fallacy — LabXchange, “Independent Events and the Gambler’s Fallacy”**  
   URL: https://www.labxchange.org/library/items/lb:LabXchange:d3429cd1:html:1  
   Explains that independent fair coin tosses each remain 50/50 despite a streak. Clarifies that any particular sequence of ten fair tosses has probability 1/1,024, whether it looks mixed or all heads, and distinguishes independent tosses from dependent draws without replacement.

8. **Size–weight illusion — Pisu, Graf & Adams, PLOS Computational Biology, “The size-weight illusion and beyond: A new model of perceived weight”**  
   URL: https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1013496  
   Peer-reviewed open-access research reports that the smaller of two equal-weight, same-apparent-material objects is typically perceived as heavier, even when participants know the weights. The article discusses multiple competing explanations and reports contextual effects of weight and density; the copy avoids presenting one mechanism as settled.

9. **Color constancy — Gegenfurtner et al., Journal of Vision, “Color constancy in real-world settings”**  
   URL: https://jov.arvojournals.org/article.aspx?articleid=2793408  
   Defines color constancy as relatively stable color perception despite changes in illumination, notes the ambiguity between illumination and surface reflectance, and reports high consistency in a natural real-world color-matching task across several illuminants. The copy qualifies the effect rather than calling it perfect in all circumstances.

10. **Friendship paradox — Yale School of Management, Yale Insights, “Your Friends Have More Friends Than You—and That’s a Good Thing for Marketers and Public Health Officials”**  
    URL: https://insights.som.yale.edu/insights/your-friends-have-more-friends-than-you-and-thats-good-thing-for-marketers-and-public  
    Describes the network result that friends have more friends on average and gives the sampling intuition behind identifying highly connected nodes through a random person’s friends. The article’s statement is explicitly about averages, not a rule for every individual.

## Editorial review

The Simpson’s-paradox opening was clarified to refer to one treatment being better within every subgroup but worse in the pooled comparison. The Benford explanation explicitly uses steady **percentage** growth: without that condition, the linear intervals 100–200 and 900–1,000 are equal in length and would not explain the logarithmic pattern. These clarifications narrow the prose to the reasoning supported by the cited sources.
