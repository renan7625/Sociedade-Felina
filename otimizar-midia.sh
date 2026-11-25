#!/usr/bin/env bash
# Otimiza os vídeos de depoimento para mobile (requer ffmpeg instalado).
# Uso: bash otimizar-midia.sh
# Gera assets/otimizado/depoimento-N.mp4 SEM mexer nos originais. Confira a qualidade
# e, se gostar, copie por cima dos arquivos em assets/.
#
# O que faz:
#  - Redimensiona para 540 px de largura (vídeo vertical 9:16 => 540x960) — suficiente para celular
#  - H.264 (CRF 28, teto de ~550 kbps) + AAC mono 64 kbps: boa qualidade, arquivo bem menor
#  - +faststart: o vídeo começa a tocar antes de terminar de baixar
set -euo pipefail
mkdir -p assets/otimizado
for f in assets/depoimento-*.mp4; do
  out="assets/otimizado/$(basename "$f")"
  echo "→ $f"
  ffmpeg -y -loglevel error -i "$f" \
    -vf "scale=540:-2" -c:v libx264 -preset veryfast -crf 28 -maxrate 550k -bufsize 1100k -pix_fmt yuv420p \
    -c:a aac -b:a 64k -ac 1 -movflags +faststart "$out"
  ls -lh "$f" "$out" | awk '{print "   " $5 "  " $9}'
done
echo "Pronto. Alvo: cerca de 0,5 MB por minuto de vídeo."
