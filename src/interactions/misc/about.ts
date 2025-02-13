import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";
import { started } from "../../index";
import {EmbedBuilder} from "../../utils/embeds";

export default {
    name: "about",
    role: "CHAT_INPUT",
    description: "Get information about the bot",
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) => {
        await interaction.client.application.fetch();
        const embed = new EmbedBuilder()
            .setTitle("enka.discord")
            .setDescription("Бот Discord с открытым исходным кодом, призванный облегчить вашу жизнь в гачах благодаря возможностям enka.network.\n\nПеревод на русский: @lunyslasher")
            .addFields({
                name: "Разработчики",
                value: "[@jxtq](<https://discord.com/users/618689346828238848>) ([@jxtq.moe](<https://bsky.app/profile/jxtq.moe>))"
            },{
                name: "Пинг",
                value: `${interaction.client.ws.ping}мс`,
                inline: true
            },{
                name: "Аптайм",
                value: `<t:${Math.floor(started / 1000)}:R>`,
                inline: true
            }, {
                name: "Количество установок (серверы и пользователи)",
                value: `Серверы: ${interaction.client.guilds.cache.size}\nПользователи: ${interaction.client.application.approximateUserInstallCount ?? 0}`,
                inline: true
            })

        const ghButton = new ButtonBuilder()
            .setLabel("GitHub")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/LumiFae/enka.discord")

        const ghButtonRu = new ButtonBuilder()
            .setLabel("GitHub RU")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/lunyslasher/enka.discord.ru")

        // const inviteButton = new ButtonBuilder()
        //     .setLabel("Invite")
        //     .setStyle(ButtonStyle.Link)
        //     .setURL("https://discord.com/oauth2/authorize?client_id=1296584939583701044")
        //
        // const donateButton = new ButtonBuilder()
        //     .setLabel("Donate")
        //     .setStyle(ButtonStyle.Link)
        //     .setURL("https://ko-fi.com/jxtq")

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(ghButton, ghButtonRu)

        await interaction.reply({ embeds: [embed], components: [row] })
    },
} satisfies Command;
