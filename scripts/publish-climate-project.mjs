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

const climateData = {
  slug: 'climate-modeling-east-africa',
  title: 'Computational Modeling and Environmental Data Analysis for Climate Change Assessment in East Africa (2000–2024)',
  abstract: 'East Africa faces increasing vulnerability to climate change due to its dependence on climate-sensitive systems such as agriculture and water resources. This study examines regional climate trends between 2000 and 2024 through computational analysis of temperature, rainfall, and carbon dioxide emissions data. Using transparent data preprocessing pipelines, time-series modeling, and interpretable machine learning methods, the research identifies gradual regional warming, rising variability in rainfall, and steady growth in CO₂ emissions. This is the core foundation of the “ClimateModelIA Regulator Project”, the climate data prediction analyser, Estimator and Regulator to bridge the downbacks in Agricultural Production Across Sub-Saharan region.',
  pdf_url: '/uploads/AimeSergeUkobizabaResume.pdf', 
  tags: ['Climate Change', 'Environmental Data Analysis', 'Computational Modeling', 'East Africa', 'Agriculture'],
  
  // Project-specific fields
  tagline: 'Climate Data Prediction & Analysis for Sub-Saharan Agriculture',
  role: 'Lead Researcher & Developer',
  summary: 'A self-designed research project applying Seasonal ARIMA and Random Forest models to analyze 24 years of East African climate data.',
  description: `This project investigates regional climate trends (2000–2024) using computational methods to support agricultural resilience. It focuses on identifying warming trends, rainfall variability, and CO2 growth using Python-based data pipelines.

Key components:
- Seasonal ARIMA for time-series temperature analysis.
- Random Forest regression for emissions modeling.
- Data sources: NASA Earth Data & World Bank Climate Portal.

The goal is to provide localized, interpretable insights that global models often obscure, forming the basis for the ClimateModelIA Regulator Project.`,
  tools: ['Python', 'ARIMA', 'Random Forest', 'GCP', 'Data Engineering'],
  features: ['Time-series analysis', 'Machine learning modeling', 'Data-processing pipelines', 'Environmental assessment'],
  category: 'AI', // Fits the constraint
  url: 'https://github.com/AimeSerge/ClimateModelEA'
};

async function publishProject() {
  console.log('🚀 Publishing to PROJECTS table...');
  const { data: project, error: pError } = await supabase
    .from('projects')
    .upsert({
      slug: climateData.slug,
      title: climateData.title,
      tagline: climateData.tagline,
      role: climateData.role,
      summary: climateData.summary,
      description: climateData.description,
      tools: climateData.tools,
      features: climateData.features,
      category: climateData.category,
      url: climateData.url,
      pdf_url: climateData.pdf_url,
      is_visible: true,
      contributors: ['Aime Serge UKOBIZABA'],
      association: 'Independent Research'
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (pError) {
    console.error('❌ Project Upsert Failed:', pError.message);
  } else {
    console.log('✅ Project published.');
  }

  console.log('🚀 Publishing to RESEARCH table (Base columns)...');
  const { data: research, error: rError } = await supabase
    .from('research')
    .upsert({
      slug: climateData.slug,
      title: climateData.title,
      abstract: climateData.abstract,
      pdf_url: climateData.pdf_url,
      tags: climateData.tags
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (rError) {
    console.error('❌ Research Upsert Failed:', rError.message);
  } else {
    console.log('✅ Research artifact published.');
  }

  if (project || research) {
    const id = project?.id || research?.id;
    console.log('🧠 Vectorizing for AI Knowledge Base...');
    const contentToEmbed = `
Project/Research: ${climateData.title}
Summary: ${climateData.summary}
Abstract: ${climateData.abstract}
Description: ${climateData.description}
Tags: ${climateData.tags.join(', ')}
Tools: ${climateData.tools.join(', ')}
    `.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(contentToEmbed);
    const embedding = result.embedding.values;

    await supabase.from('knowledge').upsert({
      id: id,
      content: contentToEmbed,
      embedding: embedding,
      metadata: { type: 'project', slug: climateData.slug, title: climateData.title }
    });
    console.log('✨ Knowledge Base Synchronized.');
  }
}

publishProject();
