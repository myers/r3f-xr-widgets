---
title: Live Demos
---

<script setup>
import { data } from './demos.data'
</script>

# Live Demos

Explore our interactive WebXR demos. Each demo showcases different features and components from the r3f-xr-widgets library.

::: tip VR Headset Required
These demos use WebXR and are best experienced with a VR headset (Meta Quest, etc.). Desktop browsers can view the scenes but won't have XR functionality.
:::

## Available Demos

<div v-for="demo in data" :key="demo.slug" class="demo-card">

### {{ demo.name }}

<p class="demo-description">{{ demo.description }}</p>

<div class="demo-meta">
  <div class="demo-links">
    <a :href="`/r3f-xr-widgets/${demo.path}/`" target="_self" class="demo-link">
      🚀 Launch Demo
    </a>
    <a :href="`https://github.com/myers/r3f-xr-widgets/tree/main/demos/${demo.path}`" target="_blank" class="source-link">
      📁 View Source
    </a>
  </div>
</div>

</div>

## Running Locally

To run any demo locally:

```bash
# Clone the repository
git clone https://github.com/myers/r3f-xr-widgets.git
cd r3f-xr-widgets

# Install dependencies
pnpm install

# Run a specific demo (e.g., resizable-window)
pnpm demo:resizable-window
```

<style scoped>
.demo-card {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.demo-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  border-bottom: none;
}

.demo-description {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.demo-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: black;
}

.demo-link, .source-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.demo-link {
  background: var(--vp-c-brand-1);
  color: black;
}

.demo-link:hover {
  background: var(--vp-c-brand-2);
}

.source-link {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.source-link:hover {
  border-color: var(--vp-c-brand-1);
}

.features ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.features li {
  margin: 0.25rem 0;
}

.dependencies {
  margin-top: 0.5rem;
}

.dependencies summary {
  cursor: pointer;
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
}

.dependencies summary:hover {
  color: var(--vp-c-brand-2);
}

.dependencies ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.dependencies li {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.dependencies code {
  font-size: 0.85rem;
}
</style>
