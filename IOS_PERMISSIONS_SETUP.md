# Configuração de Permissões iOS - App Store Compliance

## Strings de Permissão (Info.plist)

Quando executares `npx cap add ios` e abrires o projeto no Xcode, adiciona as seguintes chaves ao ficheiro `ios/App/App/Info.plist`:

### Câmara (Obrigatório)
```xml
<key>NSCameraUsageDescription</key>
<string>O METAFIT utiliza a câmara para capturar fotografias das tuas refeições e alimentos. Por exemplo, ao tirares uma foto do teu almoço, a nossa inteligência artificial identifica automaticamente os ingredientes (como arroz, frango, legumes) e calcula os valores nutricionais exactos: calorias, proteínas, hidratos de carbono e gorduras. Isto permite-te acompanhar a tua alimentação diária e atingir os teus objectivos de saúde e fitness de forma simples e rápida.</string>
```

### Galeria de Fotos - Leitura (Obrigatório)
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>O METAFIT precisa de acesso à tua galeria de fotos para que possas seleccionar imagens de refeições que já tiraste anteriormente. Por exemplo, se tiraste uma foto do pequeno-almoço de manhã, podes seleccioná-la mais tarde da galeria e a nossa IA irá analisar os alimentos presentes na imagem, calculando as calorias e macronutrientes (proteínas, hidratos de carbono e gorduras) para te ajudar a monitorizar a tua nutrição.</string>
```

### Galeria de Fotos - Escrita (Opcional)
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>O METAFIT pode guardar as fotografias das tuas análises de refeições na galeria do dispositivo. Isto permite-te manter um registo visual das tuas refeições analisadas para consulta futura e acompanhamento do teu progresso nutricional ao longo do tempo.</string>
```

## Como Adicionar no Xcode

1. Abre o projeto iOS: `npx cap open ios`
2. No Xcode, selecciona o ficheiro `Info.plist` no navegador de ficheiros
3. Clica com botão direito e selecciona "Add Row"
4. Adiciona cada uma das chaves acima com os valores correspondentes
5. Guarda o ficheiro (Cmd+S)

## Verificação

Antes de submeter à App Store, verifica que:
- [x] NSCameraUsageDescription está presente e explica claramente o uso COM EXEMPLO ESPECÍFICO
- [x] NSPhotoLibraryUsageDescription está presente e explica claramente o uso COM EXEMPLO ESPECÍFICO
- [x] As descrições mencionam especificamente "análise de refeições", "calcular calorias" e "macronutrientes"
- [x] As descrições incluem exemplos concretos (ex: "foto do almoço", "arroz, frango, legumes")
- [x] As descrições estão em português

## Notas Importantes

- A Apple rejeita apps com descrições vagas como "A app precisa de acesso à câmara" ou "para carregar fotos"
- As descrições devem explicar COMO os dados serão usados
- **OBRIGATÓRIO**: Incluir um exemplo específico de uso (ex: "ao tirares uma foto do teu almoço...")
- As descrições devem explicar o benefício para o utilizador (ex: "atingir os teus objectivos de saúde")

## Exemplo de Descrição que PASSA na Revisão

✅ "O METAFIT utiliza a câmara para capturar fotografias das tuas refeições e alimentos. Por exemplo, ao tirares uma foto do teu almoço, a nossa inteligência artificial identifica automaticamente os ingredientes (como arroz, frango, legumes) e calcula os valores nutricionais exactos..."

## Exemplo de Descrição que NÃO PASSA na Revisão

❌ "METAFIT NUTRI needs access to your camera to upload photos."
❌ "A app precisa de acesso à câmara"
❌ "Para tirar fotos das refeições"
