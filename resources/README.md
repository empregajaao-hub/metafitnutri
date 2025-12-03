# Assets para Capacitor

Coloca aqui os seguintes ficheiros para gerar todos os ícones e splash screens automaticamente:

## Ficheiros Necessários

### 1. icon.png (1024x1024px)
- Ícone do app em alta resolução
- PNG com fundo sólido (cor: #F97316 ou a cor do logo)
- NÃO usar bordas arredondadas (Android aplica automaticamente)
- Manter conteúdo importante numa área segura de 800x800px centrada

### 2. splash.png (2732x2732px)
- Splash screen em alta resolução
- PNG com o logo METAFIT centralizado
- Cor de fundo: #FCF8F3 (warm background do app)
- Área segura central: 1200x1200px para o conteúdo principal

## Como Gerar

Após colocar os ficheiros aqui, corre:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

Isto vai gerar automaticamente todos os tamanhos necessários para Android e iOS.

## Tamanhos Gerados Automaticamente

### Android:
- mdpi (48x48)
- hdpi (72x72)
- xhdpi (96x96)
- xxhdpi (144x144)
- xxxhdpi (192x192)

### iOS:
- 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt
- @1x, @2x, @3x scales
