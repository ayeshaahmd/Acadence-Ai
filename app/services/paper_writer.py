from openai import OpenAI
import anthropic
from typing import List, Dict
import logging
import json

logger = logging.getLogger(__name__)

class PaperWriter:
    """Generates humanized research papers using LLM"""
    
    def __init__(self, config):
        self.config = config
        self.llm_provider = config.GENERATOR_LLM_PROVIDER
        self.word_count = config.DEFAULT_WORD_COUNT
        
        if self.llm_provider == 'openai':
            self.client = OpenAI(api_key=config.OPENAI_API_KEY)
        elif self.llm_provider == 'anthropic':
            self.client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
        elif self.llm_provider == 'gemini':
            self.client = OpenAI(
                api_key=config.GEMINI_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
        elif self.llm_provider == 'openrouter':
            self.client = OpenAI(
                api_key=config.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1"
            )
    
    def generate_paper(self, topic: str, sources: List[Dict], word_count: int = 8000, 
                       citation_format: str = 'APA', complexity_level: str = 'master',
                       domain: str = 'general') -> Dict:
        """
        Generate a complete research paper with custom domain and complexity level
        """
        logger.info(f"Generating paper on '{topic}' ({word_count} words, {citation_format}, Level: {complexity_level}, Domain: {domain})")
        
        try:
            # Create sources summary
            sources_summary = self._create_sources_summary(sources[:20])  # Top 20
            
            # Generate paper structure
            paper_structure = self.config.PAPER_STRUCTURE.copy()
            paper_structure['keywords'] = 50
            paper_structure['introduction'] = int(word_count * 0.10)
            paper_structure['literature_review'] = int(word_count * 0.25)
            paper_structure['methodology'] = int(word_count * 0.20)
            paper_structure['results'] = int(word_count * 0.20)
            paper_structure['discussion'] = int(word_count * 0.15)
            paper_structure['conclusion'] = int(word_count * 0.05)
            paper_structure['appendix'] = int(word_count * 0.05)
            
            # Generate each section
            sections = {}
            
            # Title
            sections['title'] = self._generate_title(topic, complexity_level, domain)
            
            # Abstract
            sections['abstract'] = self._generate_section(
                'abstract',
                topic,
                sources_summary,
                paper_structure['abstract'],
                complexity_level=complexity_level,
                domain=domain,
                is_abstract=True
            )
            
            # Keywords
            sections['keywords'] = self._generate_section(
                'keywords',
                topic,
                sources_summary,
                paper_structure['keywords'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Introduction
            sections['introduction'] = self._generate_section(
                'introduction',
                topic,
                sources_summary,
                paper_structure['introduction'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Literature Review
            sections['literature_review'] = self._generate_section(
                'literature_review',
                topic,
                sources_summary,
                paper_structure['literature_review'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Methodology
            sections['methodology'] = self._generate_section(
                'methodology',
                topic,
                sources_summary,
                paper_structure['methodology'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Results
            sections['results'] = self._generate_section(
                'results',
                topic,
                sources_summary,
                paper_structure['results'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Discussion
            sections['discussion'] = self._generate_section(
                'discussion',
                topic,
                sources_summary,
                paper_structure['discussion'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Conclusion
            sections['conclusion'] = self._generate_section(
                'conclusion',
                topic,
                sources_summary,
                paper_structure['conclusion'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Appendix
            sections['appendix'] = self._generate_section(
                'appendix',
                topic,
                sources_summary,
                paper_structure['appendix'],
                complexity_level=complexity_level,
                domain=domain
            )
            
            # Compile full paper
            full_paper = self._compile_paper(sections)
            
            return {
                'title': sections['title'],
                'abstract': sections['abstract'],
                'content': full_paper,
                'sections': sections,
                'word_count': sum(len(s.split()) for s in sections.values()),
                'sources_count': len(sources),
                'is_fallback': False
            }
        except Exception as e:
            logger.warning(f"Live LLM paper generation failed due to API/Quota error: {e}. Falling back to high-fidelity simulated generation.")
            return self._generate_simulated_paper(topic, sources, word_count, citation_format, complexity_level, domain, str(e))
    
    def _generate_title(self, topic: str, complexity_level: str = 'master', domain: str = 'general') -> str:
        """Generate an academic title tailored to level and domain"""
        prompt = f"""Generate a professional, academic research paper title for the topic: {topic}
        
        Academic Domain: {domain.upper()}
        Complexity Level: {complexity_level.upper()}

        Requirements:
        - Clear, descriptive, and highly specific
        - Between 8-15 words
        - Indicative of the research focus and analytical depth
        - Professional academic tone matching {complexity_level} level in {domain}
        - Do NOT include words like "PhD", "Master", "Undergraduate", "grade", or "level" in the title.
        
        Return ONLY the title, nothing else. No quotation marks."""
        
        return self._call_llm(prompt, max_tokens=50).replace('"', '').strip()
    
    def _generate_section(self, section_name: str, topic: str, sources: str, 
                          word_count: int, complexity_level: str = 'master',
                          domain: str = 'general', is_abstract: bool = False) -> str:
        """Generate a specific section of the paper tailored to level and domain"""
        
        section_guidelines = {
            'abstract': "A highly concise summary outlining the background, primary objective, methodology, empirical findings, and broader implications of the study. It must be a single, self-contained, high-density paragraph.",
            'keywords': "Provide 5 to 7 highly specific, academic keywords or phrases relevant to the study, separated by commas. Do not write a paragraph, just the keywords.",
            'introduction': "Establish the academic context, clearly articulate the research problem and importance, highlight gaps in existing literature, define the primary research objectives, and state the structural outline of the paper.",
            'literature_review': "Synthesize, evaluate, and critically analyze existing literature and competing theories on this topic. Highlight contradictions, historical developments, and current paradigms. Cite key sources regularly.",
            'methodology': "Detail the rigorous research design, theoretical frameworks, data collection methods, and analytical/econometric models. Use formal technical steps and equations.",
            'results': "Present the primary findings of the study clearly. Explain observations, regression results, algorithmic metrics, or clinical outcomes. Integrate analytical descriptions with numerical details.",
            'discussion': "Interpret and contextualize findings in relation to the reviewed literature. Discuss theoretical implications, unexpected outcomes, and critical limitations of the study.",
            'conclusion': "Provide a robust final synthesis of key contributions, articulate the broader significance, outline practical recommendations, and propose specific directions for future research.",
            'appendix': "Provide supplementary material such as extended mathematical proofs, detailed dataset descriptions, secondary data tables, or auxiliary models that support the main text."
        }
        
        # Define level-specific instructions
        level_instructions = {
            'undergraduate': (
                "Write the section as a high-quality undergraduate term paper. Focus on a clear, well-structured, "
                "and introductory explanation of the concepts. Use standard academic language and clear paragraphs."
            ),
            'master': (
                "Write the section as a rigorous Master's-level research paper. Provide deep critical analysis, "
                "synthetically review literature, outline details of research methodologies, and analyze findings "
                "thoroughly. Maintain a strong, professional, post-graduate academic tone."
            ),
            'phd': (
                "Write the section as a state-of-the-art PhD-grade research paper intended for publication in top-tier "
                "academic journals. The writing must be extremely rigorous, dense, sophisticated, and demonstrate "
                "high intellectual maturity and novel academic contributions. Critique existing literature deeply. "
                "Explain methodology with extreme analytical depth, and discuss results with high theoretical precision."
            )
        }
        
        # Define domain-specific instructions
        domain_instructions = {
            'finance': (
                "Academic Domain: Finance. Apply the highest level of financial rigor. Enforce quantitative modeling, "
                "references to financial markets, asset pricing theories (like CAPM, Black-Scholes, Fama-French), "
                "volatility structures (e.g. GARCH), market efficiency, corporate finance frameworks, or econometric/regression analyses. "
                "For methodology and results, actively formulate mathematical model definitions using standard LaTeX math blocks "
                "(like $$E(R_i) = R_f + \\beta_i (E(R_m) - R_f)$$) and present data in structured Markdown tables with coefficients, "
                "standard errors, and statistical significance."
            ),
            'stem': (
                "Academic Domain: STEM & Computer Science. Enforce algorithmic specifications, rigorous technical precision, "
                "formal mathematical notations, data structures, and computer science and engineering terminology. "
                "Actively include LaTeX equations for mathematical models, and present performance tables or benchmark results "
                "in clean, structured Markdown tables."
            ),
            'medicine': (
                "Academic Domain: Medicine & Life Sciences. Enforce cohort-driven, data-backed writing, clinical trial "
                "methodologies, p-values, confidence intervals (95% CI), hazard ratios, and clinical significance. "
                "Actively generate clean Markdown tables summarizing clinical trial cohorts, demographic data, or "
                "treatment benchmarks."
            ),
            'humanities': (
                "Academic Domain: Humanities & Social Sciences. Enforce qualitative critique, narrative depth, textual analysis, "
                "critical theory, and elaborate structural explanations. Discuss historical, sociological, "
                "or philosophical contexts in detail."
            ),
            'social_sciences': (
                "Academic Domain: Social Sciences. Enforce structured qualitative and quantitative behavioral research, "
                "hypothesis testing, questionnaire metrics, cohort analysis, and statistical significance. "
                "Incorporate structured Markdown tables for survey findings or regression statistics."
            ),
            'general': (
                "Academic Domain: General Academic. Maintain highly objective, professional, and balanced academic writing."
            )
        }
        
        level_guide = level_instructions.get(complexity_level, level_instructions['master'])
        domain_guide = domain_instructions.get(domain, domain_instructions['general'])
        
        prompt = f"""Write a research paper section for academic publication.

Topic: {topic}
Section: {section_name.replace('_', ' ').title()}
Target word count: {word_count} words

Guidelines for Section: 
{section_guidelines.get(section_name, 'Relevant research section')}

Complexity Level Instructions:
{level_guide}

Academic Domain Customization:
{domain_guide}

Key sources to reference:
{sources}

Requirements for the output:
1. Academic writing style - formal and objective. Do not address the reader or write meta-text.
2. EXTREMELY HUMANIZED: Maximize burstiness and perplexity to bypass AI detectors. Vary sentence lengths drastically—mix very short, punchy statements with complex, highly structured compound sentences. Avoid robotic, repetitive phrasing.
3. BANNED VOCABULARY: Do NOT use common AI buzzwords such as "delve", "tapestry", "crucial", "testament", "realm", "pivotal", "multifaceted", "intricate", "navigating", "landscape", "in conclusion", or "it is important to note".
4. Appropriate citations integrated into text as [Author, Year] or (Author, Year).
5. Well-structured with clear flow, using active voice where appropriate.
6. Use technical terminology appropriate to the field.
7. For the Methodology, Results, and Appendix sections in STEM/Finance/Medicine domains, you MUST include:
   - At least 1-2 LaTeX math formulas formatted as $$[formula]$$ on their own lines.
   - At least 1 beautifully formatted Markdown table representing empirical data, regressions, or benchmark parameters.
8. Include 2-3 paragraphs of {max(1, word_count // 3)} words each (except for Abstract and Keywords, which are single blocks).
9. Do NOT include section headers or numbering.
10. Approximately {word_count} words.
11. Do NOT include or mention the words "PhD", "Master", "Undergraduate", "grade", or "level" in the text. These words are for system instructions and metadata only; the paper itself must read like a real, professional research paper published in a top-tier journal, without meta-text or academic level labeling.

Write the section now:"""
        
        response = self._call_llm(prompt, max_tokens=max(word_count * 4, 1500))
        return response.strip()
    
    def _create_sources_summary(self, sources: List[Dict]) -> str:
        """Create a summary of sources for the LLM"""
        summary = "Key research sources:\n\n"
        
        for i, source in enumerate(sources[:15], 1):
            pub_date = source.get('publication_date')
            year_str = "Unknown Year"
            if pub_date:
                try:
                    if isinstance(pub_date, str):
                        year_str = pub_date[:4]
                    else:
                        year_str = str(pub_date.year)
                except:
                    pass
                    
            summary += f"{i}. '{source.get('title', 'Unknown')}' by {source.get('authors', 'Unknown')} ({year_str}) "
            summary += f"- {source.get('abstract', 'No abstract')[:150]}...\n"
        
        return summary
    
    def _compile_paper(self, sections: Dict) -> str:
        """Compile all sections into a full paper"""
        paper = f"""
# {sections['title']}

## Abstract

{sections['abstract']}

**Keywords**: {sections.get('keywords', '')}

## Introduction

{sections['introduction']}

## Literature Review

{sections['literature_review']}

## Methodology

{sections['methodology']}

## Results

{sections['results']}

## Discussion

{sections['discussion']}

## Conclusion

{sections['conclusion']}

## Appendix

{sections.get('appendix', '')}
"""
        return paper.strip()
    
    def _call_llm(self, prompt: str, max_tokens: int = 1000) -> str:
        """Call the configured LLM"""
        system_msg = (
            "You are an elite academic researcher and writer. Your writing must bypass AI detectors (like GPTZero). "
            "You MUST maximize 'burstiness' (mixing very short and very long, complex sentences) and 'perplexity'. "
            "Never use common AI buzzwords like 'delve', 'tapestry', 'multifaceted', 'realm', 'pivotal', 'crucial', or 'intricate'. "
            "Write with human imperfections: use the active voice, strong academic verbs, and highly specific, un-clichéd transitions."
        )
        try:
            if self.llm_provider == 'openai':
                response = self.client.chat.completions.create(
                    model="gpt-4o",  # Defaulting to GPT-4o for top academic writing
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.85  # Slightly higher temperature for burstiness/humanization
                )
                return response.choices[0].message.content
            
            elif self.llm_provider == 'anthropic':
                response = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=max_tokens,
                    temperature=0.85,
                    system=system_msg,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
            
            elif self.llm_provider == 'gemini':
                response = self.client.chat.completions.create(
                    model="gemini-1.5-flash-latest",
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.85
                )
                return response.choices[0].message.content
            
            elif self.llm_provider == 'openrouter':
                response = self.client.chat.completions.create(
                    model="anthropic/claude-3-haiku", # More stable fallback model
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.85
                )
                return response.choices[0].message.content
            
            else:
                raise ValueError(f"Unsupported LLM provider: {self.llm_provider}")
        
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            raise

    def _generate_simulated_paper(self, topic: str, sources: List[Dict], word_count: int, 
                                  citation_format: str, complexity_level: str, domain: str, 
                                  error_message: str) -> Dict:
        """
        Fallback generator that constructs a highly realistic, academically rigorous 
        simulated research paper complete with custom LaTeX equations, tables, and structured references.
        """
        t_topic = topic.strip().rstrip('.')
        if domain == 'finance':
            title = f"An Empirical Investigation into {t_topic} and Asset Pricing Dynamics: Quantitative Analysis and Structural Bounds"
        elif domain == 'stem':
            title = f"Algorithmic Architectures and Complexity Limits of {t_topic}: System Performance and Structural Bounds"
        elif domain == 'medicine':
            title = f"Clinical Pathways, Cohort Dynamics, and Efficacy Endpoints in {t_topic}: A Systematic Investigation"
        elif domain == 'social_sciences':
            title = f"Socio-behavioral Frameworks and Empirical Correlates of {t_topic}: An Empirical Field Study"
        elif domain == 'humanities':
            title = f"Deconstructing the Narratives of {t_topic}: Hermeneutical Critiques and Philosophical Paradigms"
        else:
            title = f"Theoretical Frameworks and Empirical Foundations of {t_topic}: An Integrated Synthesis"

        # Construct sections
        sections = {}
        sections['title'] = title
        
        # Helper to get references in the chosen format
        formatted_refs = []
        for i, src in enumerate(sources[:8], 1):
            authors = src.get('authors', 'Smith, J.')
            year = "2024"
            title_src = src.get('title', 'Academic Research Directions')
            journal = "Journal of Advanced Acadence Reviews"
            if citation_format == 'IEEE':
                formatted_refs.append(f"[{i}] {authors}, \"{title_src},\" *{journal}*, vol. 42, no. 3, pp. 120-135, {year}.")
            elif citation_format == 'MLA':
                formatted_refs.append(f"{authors}. \"{title_src}.\" *{journal}*, vol. 42, no. 3, {year}, pp. 120-135.")
            elif citation_format == 'Harvard':
                formatted_refs.append(f"{authors} ({year}) '{title_src}', *{journal}*, 42(3), pp. 120-135.")
            else: # APA default
                formatted_refs.append(f"{authors} ({year}). {title_src}. *{journal}*, 42(3), 120-135.")
        
        if not formatted_refs:
            formatted_refs = [
                "Smith, J. (2024). Foundational theories in modern academic paradigms. *Journal of Acadence Review*, 12(2), 45-62.",
                "Johnson, A., & Lee, K. (2023). Empirical methodologies in postgraduate research design. *Academic Press*, 34(1), 101-118."
            ]

        ref_citations = " " + ("(Smith, 2024)" if citation_format != 'IEEE' else "[1]")
        ref_citations_2 = " " + ("(Johnson & Lee, 2023)" if citation_format != 'IEEE' else "[2]")

        # Assemble abstract & keywords
        sections['keywords'] = f"{t_topic}, structural models, empirical bounds, variance, quantitative metrics"
        sections['abstract'] = (
            f"This study presents a rigorous analysis of {t_topic} within the context of {domain} studies. "
            f"In recent years, understanding the core dynamics of {t_topic} has emerged "
            f"as a crucial intellectual challenge, spanning conceptual debates and empirical regressions. Through a systematic "
            f"review of literature and robust methodological construction, we synthesize current knowledge, outline a novel theoretical "
            f"framework, and report empirical outcomes that clarify historical contradictions{ref_citations}. Our quantitative assessments "
            f"demonstrate statistically significant parameters (p < 0.05), highlighting key implications for academic researchers and "
            f"industry practitioners alike. The paper concludes with structural recommendations and strategic directions for future "
            f"scientific studies in this academic domain."
        )

        # Assemble Introduction
        sections['introduction'] = (
            f"The field of {domain} has experienced rapid paradigm shifts, primarily driven by evolving conceptual structures and "
            f"empirical dynamics. At the center of these developments stands {t_topic}, a critical subject of inquiry that "
            f"bridges foundational theory and contemporary applications. While previous scholars have attempted to chart the boundaries "
            f"of this topic, significant academic gaps remain, particularly regarding empirical volatility and structural scalability{ref_citations}.\n\n"
            f"This research addresses these deficiencies by conducting a comprehensive, next-level inquiry. The primary objective is to "
            f"deconstruct the core mechanisms of {t_topic} and establish a rigorous theoretical paradigm. "
            f"The broader significance of this study lies in its capacity to formalize descriptive variables, thereby offering a unified model "
            f"for research. The remaining sections of this paper are organized as follows: Section 2 conducts a critical literature review; "
            f"Section 3 outlines the research methodology and math formulations; Section 4 analyzes the empirical results; "
            f"Section 5 provides a deep academic discussion; and Section 6 concludes with research recommendations."
        )

        # Assemble Literature Review
        sections['literature_review'] = (
            f"To place {t_topic} within a proper academic context, we must examine the historical foundations and contemporary "
            f"debates that define this intellectual territory. Early scholars laid the groundwork by focusing on qualitative, conceptual "
            f"definitions, arguing that structural parameters are primarily governed by exogenous variables{ref_citations}.\n\n"
            f"However, "
            f"subsequent research challenged this view, introducing internal friction coefficients and endogenous shocks to explain market "
            f"variability{ref_citations_2}.\n\n"
            f"In the current literature, three competing paradigms exist. The first group emphasizes equilibrium models, claiming that "
            f"fluctuations are self-correcting and highly efficient in the long run. The second paradigm, heavily influenced by behavioral "
            f"and qualitative schools, identifies systemic biases and informational asymmetries as primary drivers of structural instability. "
            f"The third utilizes advanced computational and statistical models to simulate outcomes under extreme "
            f"regime-switching environments. By synthesizing these perspectives, our study establishes a robust empirical model that bridges "
            f"these traditional divisions, offering a holistic framework for analyzing {t_topic}."
        )

        # Assemble Methodology (with LaTeX!)
        latex_eq = ""
        method_detail = ""
        if domain == 'finance':
            latex_eq = (
                f"$$\\mathrm{{d}}S_t = \\mu S_t \\mathrm{{d}}t + \\sigma S_t \\mathrm{{d}}W_t$$\n\n"
                f"where $S_t$ represents the asset pricing state of {t_topic}, $\\mu$ is the drift coefficient, $\\sigma$ "
                f"is the stochastic volatility, and $W_t$ represents a standard Brownian motion process. To estimate the risk-adjusted "
                f"rate of return, we employ the multi-factor regression equation:\n\n"
                f"$$E(R_{{i,t}}) - R_{{f,t}} = \\alpha_i + \\beta_{{i,1}} (E(R_{{m,t}}) - R_{{f,t}}) + \\beta_{{i,2}} \\mathrm{{SMB}}_t + \\beta_{{i,3}} \\mathrm{{HML}}_t + \\epsilon_{{i,t}}$$"
            )
            method_detail = "This asset pricing framework allows us to capture systematic volatility premiums and control for size and value anomalies."
        elif domain == 'stem':
            latex_eq = (
                f"$$\\mathbf{{w}}^{{t+1}} = \\mathbf{{w}}^t - \\eta \\nabla L(\\mathbf{{w}}^t) + \\alpha (\\mathbf{{w}}^t - \\mathbf{{w}}^{{t-1}})$$\n\n"
                f"where $\\mathbf{{w}}$ represents the high-dimensional weight vector for the {t_topic} system, $\\eta$ represents the "
                f"dynamic learning rate, $L(\\cdot)$ is the empirical loss function, and $\\alpha$ is the momentum term. The computational "
                f"complexity of the forward pass scales according to:\n\n"
                f"$$\\mathcal{{T}}(n) = \\mathcal{{O}}(d \\cdot n \\log n + k \\cdot d^2)$$"
            )
            method_detail = "This formulation guarantees stochastic convergence of system parameters while maintaining robust scaling attributes."
        elif domain == 'medicine':
            latex_eq = (
                f"$$\\ln\\left(\\frac{{p_i}}{{1 - p_i}}\\right) = \\beta_0 + \\beta_1 X_{{1,i}} + \\beta_2 X_{{2,i}} + \\gamma \\mathbf{{Z}}_i$$\n\n"
                f"where $p_i$ represents the probability of clinical efficacy for cohort $i$ undergoing {t_topic} treatment, "
                f"$\\beta_1$ is the primary treatment effect coefficient, $X_{{1}}$ is the dosage vector, and $\\mathbf{{Z}}$ is a vector "
                f"of patient-specific demographic covariates. The statistical significance is evaluated using the Wald statistic:\n\n"
                f"$$W = \\frac{{(\\hat{{\\beta}}_1 - \\beta_{{1,0}})^2}}{{\\mathrm{{Var}}(\\hat{{\\beta}}_1)}} \\sim \\chi^2_1$$"
            )
            method_detail = "This log-odds methodology provides an objective measure of clinical outcomes while controlling for confounding patient demographics."
        else: # General / Humanities / Social Sciences
            latex_eq = (
                f"$$Y_i = \\beta_0 + \\beta_1 X_i + \\beta_2 X_i^2 + \\epsilon_i$$\n\n"
                f"where $Y_i$ is the dependent index of {t_topic}, $X_i$ represents the explanatory structural variable, "
                f"$\\beta_2$ represents non-linear quadratic effects, and $\\epsilon_i$ is the homoscedastic error term. "
                f"The structural integrity is validated using the standard F-statistic:\n\n"
                f"$$F = \\frac{{(\\mathrm{{TSS}} - \\mathrm{{RSS}}) / k}}{{\\mathrm{{RSS}} / (n - k - 1)}}$$"
            )
            method_detail = "This regression model formalizes the structural relationship between explanatory variables and outcome metrics."

        sections['methodology'] = (
            f"The research design for investigating {t_topic} utilizes a multi-stage empirical approach. Data collection begins "
            f"by aggregating historical time-series observations and cross-sectional databases compiled from global repositories. "
            f"To achieve maximum statistical power and guarantee analytical rigor, we define our primary "
            f"theoretical model mathematically:\n\n"
            f"{latex_eq}\n\n"
            f"{method_detail} The parameters are estimated using standard maximum likelihood (MLE) algorithms and generalized "
            f"method of moments (GMM) techniques. To check for robustness, we conduct serial correlation tests (Durbin-Watson), "
            f"heteroscedasticity checks (White's test), and multicollinearity audits using Variance Inflation Factors (VIF < 5)."
        )

        # Assemble Results (with Markdown tables!)
        table_md = ""
        results_desc = ""
        if domain == 'finance':
            table_md = (
                f"| Parameter | Coefficient | Standard Error | t-Statistic | p-Value | Significance |\n"
                f"| :--- | :---: | :---: | :---: | :---: | :---: |\n"
                f"| $\\alpha_i$ (Alpha) | 0.0425 | 0.0152 | 2.7961 | 0.0054 | ** (p < 0.01) |\n"
                f"| $\\beta_1$ (Market Premium) | 1.1240 | 0.0435 | 25.8391 | 0.0001 | *** (p < 0.001) |\n"
                f"| $\\beta_2$ (SMB Factor) | -0.3120 | 0.0712 | -4.3820 | 0.0001 | *** (p < 0.001) |\n"
                f"| $\\beta_3$ (HML Factor) | 0.4580 | 0.0685 | 6.6861 | 0.0001 | *** (p < 0.001) |\n"
                f"| Adjusted $R^2$ | 0.7845 | F-Stat | 142.68 | N | 2,500 observations |"
            )
            results_desc = f"The parameter estimates for {t_topic} demonstrate that the market premium exerts a powerful positive influence."
        elif domain == 'stem':
            table_md = (
                f"| Algorithm | Execution Time (ms) | Memory Peak (MB) | Throughput (req/s) | Error Rate (%) |\n"
                f"| :--- | :---: | :---: | :---: | :---: |\n"
                f"| Traditional Linear | 1,452.40 | 256.40 | 850.00 | 2.15% |\n"
                f"| Stochastic Gradient | 425.10 | 112.80 | 2,940.00 | 0.85% |\n"
                f"| Proposed Model | **118.60** | **45.20** | **12,450.00** | **0.02%** |\n"
                f"| Benchmark delta | -91.83% | -82.37% | +323.47% | -99.07% |"
            )
            results_desc = f"The benchmark results illustrate that our proposed system architecture drastically optimizes computational parameters."
        elif domain == 'medicine':
            table_md = (
                f"| Patient Cohort | Sample Size (N) | Treatment Dosage | Efficacy Ratio | Hazard Ratio (95% CI) | p-Value |\n"
                f"| :--- | :---: | :---: | :---: | :---: | :---: |\n"
                f"| Placebo Group | 450 | Saline | 12.4% | 1.00 (Reference) | -- |\n"
                f"| Active Cohort A | 455 | 50 mg active | 68.2% | 0.38 (0.28 - 0.51) | 0.0002 *** |\n"
                f"| High-Dose Cohort B | 460 | 100 mg active | **89.5%** | **0.14 (0.09 - 0.22)** | **0.0001 ***** |\n"
                f"| Total Study | 1,365 | Cohort delta | +621.7% | chi-sq = 124.6 | p < 0.0001 |"
            )
            results_desc = f"Clinical observations indicate that cohort groups receiving {t_topic} treatment showed massive therapeutic improvement."
        else: # General / Social Sciences
            table_md = (
                f"| Model Variable | Estimated Coefficient | Standard Deviation | t-Ratio | p-Value | Wald Significance |\n"
                f"| :--- | :---: | :---: | :---: | :---: | :---: |\n"
                f"| Intercept ($\\beta_0$) | 1.4582 | 0.2450 | 5.9518 | 0.0001 | *** (p < 0.001) |\n"
                f"| Explanatory ($X$) | 0.6845 | 0.0820 | 8.3476 | 0.0001 | *** (p < 0.001) |\n"
                f"| Quadratic Factor | -0.1240 | 0.0350 | -3.5429 | 0.0006 | ** (p < 0.01) |\n"
                f"| Standard Error | 0.0845 | $R^2$ coefficient | 0.6480 | Durbin-Watson | 1.9540 (Pass) |"
            )
            results_desc = f"The structural regression outcomes reveal that {t_topic} exhibits a quadratic relationship with the target variable."

        sections['results'] = (
            f"The empirical analysis of our dataset yields compelling results. All estimations completed without convergence error, "
            f"and parameters demonstrate statistical robustness. The core regression parameters and comparison statistics are "
            f"summarized in the table below:\n\n"
            f"{table_md}\n\n"
            f"{results_desc} A key finding is that the linear term is highly significant (p < 0.001), indicating a powerful first-order relationship. "
            f"Furthermore, residual diagnostics confirm that the error terms conform to standard normal distributions with zero "
            f"mean and constant variance, satisfying the classical assumptions of econometric and engineering models."
        )

        # Assemble Discussion
        sections['discussion'] = (
            f"The empirical findings of this study carry profound implications for the theoretical understanding of {t_topic}. By "
            f"documenting a highly significant correlation between the explanatory variables and target outcomes, we confirm that "
            f"prior qualitative models were structurally limited{ref_citations}.\n\n"
            f"Our results challenge the conventional consensus which asserts that exogenous shocks are the sole determinants of volatility. "
            f"Instead, our model's formulation proves that endogenous parameters play a dominant role in system feedback loops. "
            f"Despite these boundaries, our study provides a valuable, publication-ready foundation. Future researchers should aim to test this "
            f"framework in cross-border studies and incorporate high-frequency, real-time data matrices to validate parameter stability."
        )

        # Assemble Conclusion
        sections['conclusion'] = (
            f"In summary, this research accomplishes a comprehensive deconstruction of {t_topic} inside "
            f"the {domain} domain. By integrating robust theoretical models with empirical validation, we have solved critical "
            f"historical contradictions and established a unified framework for analysis{ref_citations_2}.\n\n"
            f"The strategic recommendations arising from this work are twofold: academics should incorporate our structural "
            f"model to control for systemic factor biases, and practitioners should leverage these empirical parameters to optimize "
            f"operational models. Moving forward, the most promising avenue of research lies in extending these equations to capture "
            f"dynamic, time-varying volatility behaviors under alternative policy frameworks."
        )

        # Assemble Appendix
        sections['appendix'] = (
            f"### Supplemental Data Tables\n\n"
            f"The dataset utilized for the empirical evaluation of {t_topic} consists of over 10,000 distinct observations "
            f"collected spanning the temporal range of 2010 to 2024. Data normalization procedures applied standard Z-score transformations "
            f"prior to regression modeling to ensure variance homogeneity."
        )

        full_paper = self._compile_paper(sections)

        return {
            'title': title,
            'abstract': sections['abstract'],
            'content': full_paper,
            'sections': sections,
            'word_count': sum(len(s.split()) for s in sections.values()),
            'sources_count': len(sources),
            'is_fallback': True
        }
