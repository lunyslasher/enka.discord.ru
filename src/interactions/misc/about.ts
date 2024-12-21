import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";
import {Embed} from "../../utils/embeds";
import { started } from "../../index";

export default {
    name: "about",
    role: "CHAT_INPUT",
    description: "Получить информацию о боте",
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) => {
        const embed = Embed()
            .setTitle("enka.discord")
            .setDescription("Бот Discord с открытым исходным кодом, призванный облегчить вашу жизнь в гаче благодаря возможностям enka.network.")
            .addFields({
                name: "Пинг",
                value: `${interaction.client.ws.ping}ms`,
                inline: true
            },{
                name: "Аптайм",
                value: `<t:${Math.floor(started / 1000)}:R>`,
                inline: true
            });

        const ghButton = new ButtonBuilder()
            .setLabel("GitHub")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/lunyslasher/enka.discord.ru")


        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(ghButton)

        await interaction.reply({ embeds: [embed], components: [row] })
    },
} satisfies Command;
