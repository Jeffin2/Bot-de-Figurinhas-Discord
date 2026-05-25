const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Veja todos os comandos do bot'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📖 FiguVerse - Ajuda')
            .setDescription('Lista completa de comandos do bot:')
            .addFields(

                {
                    name: '🎴 Sistema de Cartas',
                    value:
                        '`/open-pack` → Abre um pacote e ganha cartas\n' +
                        '`/inventory` → Veja suas cartas\n' +
                        '`/album` → Veja seu álbum organizado por seleção'
                },

                {
                    name: '💰 Economia',
                    value:
                        '`/balance` → Veja seus coins\n' +
                        '`/daily` → Resgate recompensa diária\n' +
                        '`/give-coins` → (admin) dar coins'
                },

                {
                    name: '📦 Packs',
                    value:
                        '`/buy-pack` → Comprar packs com coins\n' +
                        '`/packs` → Ver seus packs'
                },

                {
                    name: '🛒 Mercado',
                    value:
                        '`/market` → Marketplace de cartas (vender/comprar)\n' +
                        '`/auction` → Sistema de leilão de cartas'
                },

                {
                    name: '📈 Sistema de Investimento',
                    value:
                        '`/invest add` → Investir cartas duplicadas\n' +
                        '`/invest claim` → Resgatar lucro (24h)\n' +
                        '`/invest view` → Ver investimentos'
                },

                {
                    name: '🔁 Trocas',
                    value:
                        '`/troca iniciar` → Iniciar troca com jogador\n' +
                        '`/troca add` → Adicionar cartas na troca\n' +
                        '`/troca aceitar` → Aceitar troca\n' +
                        '`/troca recusar` → Recusar troca'
                },

                {
                    name: '📊 Progressão',
                    value:
                        '`/profile` → Seu perfil (coins, cartas, etc)\n' +
                        '`/ranking` → Ranking global de XP'
                },

                {
                    name: '🛠 Outros',
                    value:
                        '`/shop` → Loja de packs\n' +
                        '`/ping` → Latência do bot'
                }
            )
            .setFooter({ text: 'FiguVerse • Sistema de Figurinhas' });

        return interaction.reply({ embeds: [embed] });
    }
};