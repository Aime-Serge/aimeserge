import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual .env.local loader
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...value] = line.split('=');
      return [key.trim(), value.join('=').trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const climateResearch = {
  slug: 'climate-modeling-east-africa',
  title: 'Computational Modeling and Environmental Data Analysis for Climate Change Assessment in East Africa (2000–2024)',
  abstract: 'East Africa faces increasing vulnerability to climate change due to its dependence on climate-sensitive systems such as agriculture and water resources. This study examines regional climate trends between 2000 and 2024 through computational analysis of temperature, rainfall, and carbon dioxide emissions data. Using transparent data preprocessing pipelines, time-series modeling, and interpretable machine learning methods, the research identifies gradual regional warming, rising variability in rainfall, and steady growth in CO₂ emissions. This is the core foundation of the “ClimateModelIA Regulator Project”, the climate data prediction analyser, Estimator and Regulator to bridge the downbacks in Agricultural Production Across Sub-Saharan region.',
  pdf_url: '/uploads/AimeSergeUkobizabaResume.pdf', // Using Resume as placeholder for now
  tags: ['Climate Change', 'Environmental Data Analysis', 'Computational Modeling', 'East Africa', 'Agriculture'],
  authors: [
    { 
      name: 'Aime Serge UKOBIZABA', 
      affiliation: 'Independent Student Researcher, Rwanda' 
    }
  ],
  publication_date: '2025-11-01',
  funding: 'Independent, self-designed research project conducted outside formal high school curriculum.',
  category: 'Environmental Data Analysis',
  language: 'en',
  content: [
    {
      id: 'intro',
      title: 'Introduction',
      order: 1,
      content: `Climate change poses a complex and uneven challenge across global regions. In East Africa, shifts in temperature and rainfall have direct consequences for food security, public health, and environmental stability. While global climate models provide valuable macro-level insight, they often obscure local variation that is critical for regional planning and interpretation.

This study approaches climate change not only as a scientific phenomenon, but also as an analytical problem: how can regional environmental data be meaningfully examined using computational tools without losing interpretability or context? Advances in data analysis and modeling enable students and researchers to engage directly with environmental datasets, asking region-specific questions and evaluating long-term trends with methodological transparency.

The guiding question of this research is:
How can computational analysis of regional environmental data contribute to a clearer understanding of climate change trends in East Africa?`
    },
    {
      id: 'context',
      title: 'Context and Related Work',
      order: 2,
      content: `Recent climate research increasingly incorporates computational methods to analyze large-scale environmental data. Neural networks and advanced regression models have been applied to global temperature and rainfall prediction, though such approaches often prioritize performance over interpretability. Studies focusing on Sub-Saharan Africa highlight the difficulty of working with incomplete datasets and limited temporal resolution.

This research situates itself within that context but adopts a deliberately restrained approach. By focusing on historical trends, regional specificity, and reproducible workflows, the study emphasizes clarity and reasoning over technical complexity. The goal is not to outperform existing models, but to complement broader climate research with localized, transparent analysis.`
    },
    {
      id: 'methodology',
      title: 'Methodology',
      order: 3,
      content: `### 3.1 Data Sources
Environmental data from 2000 to 2024 were collected from publicly available sources, including NASA Earth Data, the World Bank Climate Knowledge Portal, and UNFCCC emissions reports. Annual aggregates were used to ensure consistency and comparability across datasets.

### 3.2 Data Preparation
Data preprocessing included interpolation of missing values, outlier detection using statistical thresholds, and normalization to support cross-variable comparison. All preprocessing steps were implemented programmatically, allowing the analysis to be reproduced and scrutinized.

### 3.3 Analytical Approach
Two complementary methods were employed:
1. Time-series analysis using Seasonal ARIMA models to examine long-term temperature trends and rainfall variability.
2. Random Forest regression to explore patterns in CO₂ emissions per capita, selected for its interpretability and tolerance of nonlinear relationships.`
    },
    {
      id: 'findings',
      title: 'Findings',
      order: 4,
      content: `**Temperature**
Average surface temperature increased from 24.02°C in 2000 to 25.29°C in 2024, indicating a sustained warming trend across the region.

**Rainfall**
Annual rainfall showed considerable variability, with increasing unpredictability over time. Rather than a uniform increase or decrease, the data suggest heightened seasonal irregularity.

**CO₂ Emissions**
Per-capita CO₂ emissions rose steadily from 1.19 to 1.63 metric tons, reflecting gradual changes in energy use and urban development.`
    },
    {
      id: 'discussion',
      title: 'Interpretation and Discussion',
      order: 5,
      content: `The findings suggest that climate change in East Africa manifests not only through gradual warming, but also through instability, particularly in rainfall patterns. Computational analysis makes these patterns visible, but interpretation remains essential. Models do not explain causes on their own; they prompt further questions about human activity, policy, and environmental resilience.

From a broader perspective, this project demonstrates how computation can function as a reflective tool in environmental inquiry. By prioritizing transparency and interpretability, the analysis remains open to critique, extension, and interdisciplinary dialogue.`
    },
    {
      id: 'reproducibility',
      title: 'Reproducibility',
      order: 6,
      content: `All data, code, and documentation are publicly available to support verification and further study:
**GitHub Repository:** [https://github.com/AimeSerge/ClimateModelEA](https://github.com/AimeSerge/ClimateModelEA)`
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      order: 7,
      content: `This study uses computational methods to examine climate trends in East Africa while maintaining a focus on interpretation rather than prediction. The results highlight the value of careful data analysis in regional climate understanding and suggest pathways for future inquiry that integrate computation with environmental science, public policy, and ethics.

Future work may incorporate higher-resolution data and collaborative research models, but the core principle remains: computation is most powerful when it deepens understanding rather than obscures it.`
    }
  ]
};

async function addClimateResearch() {
  console.log('🚀 Adding Climate Research Project...');

  // 1. Insert into research table
  const { data, error } = await supabase
    .from('research')
    .upsert(climateResearch, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    console.error(`❌ Failed to add research:`, error.message);
    return;
  }

  // 2. Generate and Sync Knowledge Base (RAG)
  const sectionsContent = data.content.map(s => `${s.title}:\n${s.content}`).join('\n\n');
  const contentToEmbed = `
Research Topic: ${data.title}
Authors: ${data.authors.map(a => a.name).join(', ')}
Category: ${data.category}
Abstract: ${data.abstract}
Tags: ${data.tags.join(', ')}

Structured Content:
${sectionsContent}
  `.trim();
    
  console.log('🧠 Vectorizing knowledge base...');
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(contentToEmbed);
  const embedding = result.embedding.values;

  await supabase.from('knowledge').upsert({
    id: data.id,
    content: contentToEmbed,
    embedding: embedding,
    metadata: { type: 'research', slug: data.slug, title: data.title }
  });

  console.log(`✅ Project Added & Vectorized: ${data.slug}`);
}

addClimateResearch();
