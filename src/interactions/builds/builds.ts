import { Command } from "../../types/discord";
import {db} from "../../utils/db";
import {eq} from "drizzle-orm";
import {users} from "../../schema";
import {
    ActionRowBuilder,
    CacheType,
    ChatInputCommandInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    BaseMessageOptions
} from "discord.js";
import {Embed, generateBuildEmbed} from "../../utils/embeds";
import {api, Characters, get, getGICharacters, getHSRCharacters} from "../../utils/api";
import {HoyoCharacters, HoyosRecord, NoProfile} from "../../types/enka";
import {selectCharacter} from "../../utils/select-menus";

export default {
    name: "builds",
    role: "CHAT_INPUT",
    description: "Проверьте свои сборки или чужие",
    options: [
        {
            type: 3,
            name: "name",
            description: "Имя учетной записи enka.network, для которой вы хотите получить сборки.",
            required: false,
        },
        {
            type: 3,
            name: "uid",
            description: "UID, для которого вы хотите получить сборки",
            required: false,
        }
    ],
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) =>  {
        let name = interaction.options.getString("name");
        const uid = interaction.options.getString("uid");
        if(name && uid) {
            await interaction.reply({ content: "Пожалуйста, указывайте только имя или UID, но не оба одновременно.", ephemeral: true });
        } else if (!name && !uid) {
            name = await db.query.users.findFirst({ where: eq(users.id, interaction.user.id) }).then(user => user?.enka_name || null);
            if(!name) {
                await interaction.reply({ content: "Пользователь не найден. Подключите свою учетную запись или проверьте введенное имя учетной записи.", ephemeral: true });
                return;
            }
        }
        if(uid) return await uidFunc(interaction, uid);
        if(name) return await nameFunc(interaction, name);
        return await interaction.reply({ content: "Пожалуйста, укажите имя или UID", ephemeral: true });
    },
} satisfies Command;

async function uidFunc(interaction: ChatInputCommandInteraction<CacheType>, uid: string) {
    const embed = Embed()
        .setTitle("Выберите игру")
        .setDescription("В меню выбора ниже выберите игру, к которой относится этот UID.")
        .setFooter({ text: `UID: ${uid}`})

    const selectMenu = new StringSelectMenuBuilder().setMaxValues(1).setMinValues(1)
        .setCustomId("uid_select_game")
        .setPlaceholder("Выберите игру")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Genshin Impact")
                .setValue("genshin")
                .setDescription("Этот UID для Genshin Impact.")
                .setEmoji("1296399185691676734"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Honkai: Star Rail")
                .setValue("honkai")
                .setDescription("Этот UID для Honkai: Star Rail.")
                .setEmoji("1296399188313247774"),
        )

    return await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)] });
}

async function nameFunc(interaction: ChatInputCommandInteraction<CacheType>, name: string) {

    const apiHoyos = await api.hoyos(name);

    if (!apiHoyos) {
        await interaction.reply({ content: "Пользователь не найден. Подключите свою учетную запись повторно или проверьте введенное имя учетной записи.", ephemeral: true });
        return;
    }

    const hoyos = apiHoyos.data as HoyosRecord;

    const hoyoArray = Object.values(hoyos).filter(profile => {
        const hoyo_type = profile.hoyo_type;
        if(hoyo_type === 0) return 'showAvatarInfoList' in profile.player_info && profile.player_info.showAvatarInfoList && profile.player_info.showAvatarInfoList.length > 0
        else return 'avatarDetailList' in profile.player_info && profile.player_info.avatarDetailList && profile.player_info.avatarDetailList.length > 0
    });

    if(hoyoArray.length === 0) {
        await interaction.reply({ content: "У этого пользователя нет публичных сборок", ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const embed = generateBuildEmbed(name);

    let selectMenu = new StringSelectMenuBuilder().setMaxValues(1).setMinValues(1);

    let components: BaseMessageOptions["components"] = []

    if(hoyoArray.length > 1) {
        selectMenu.setCustomId("name_select_profile")
        selectMenu.setPlaceholder("Выберите профиль")
        selectMenu.setOptions(hoyoArray.map(profile => {
            const gameName = profile.hoyo_type === 0 ? "Genshin Impact" : "Honkai: Star Rail";
            return new StringSelectMenuOptionBuilder()
                .setLabel(profile.player_info.nickname)
                .setValue(profile.hash)
                .setDescription(gameName)
                .setEmoji(profile.hoyo_type === 0 ? "1296399185691676734" : "1296399188313247774")
        }))
    } else {
        const selectedProfileMenu = new StringSelectMenuBuilder()
            .setMaxValues(1)
            .setMinValues(1)
            .setCustomId("name_select_profile")
            .setPlaceholder("Выберите профиль")
            .setDisabled(true)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(hoyoArray[0].player_info.nickname)
                    .setValue(hoyoArray[0].hash)
                    .setDescription(hoyoArray[0].hoyo_type === 0 ? "Genshin Impact" : "Honkai: Star Rail")
                    .setEmoji(hoyoArray[0].hoyo_type === 0 ? "1296399185691676734" : "1296399188313247774")
                    .setDefault(true)
            );

        components = [...components, new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectedProfileMenu)];

        const char = await selectCharacter(interaction, name, hoyoArray[0]);

        if(!char) {
            await interaction.editReply({ content: "Произошла ошибка, попробуйте еще раз", components: [], embeds: [] });
            return;
        }

        selectMenu = char;
    }

    components = [...components, new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)];

    return await interaction.editReply({ embeds: [embed], components });
}
