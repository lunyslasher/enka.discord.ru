import {Command} from "../../../types/discord";
import {sameUser, setDefault} from "../../../utils/misc";
import {ActionRowBuilder, MessageFlagsBitField, StringSelectMenuBuilder} from "discord.js";
import API from "../../../utils/api";
import {HoyoType, HoyoType_T} from "../../../types/models";
import {selectUidCharacter} from "../../../utils/select-menus";
import {generateUidBuildEmbed} from "../../../utils/embeds";

export default {
    role: "SELECT_MENU",
    custom_id: "uid_select_game",
    run: async (interaction) => {
        if(!sameUser(interaction)) {
            return await interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                flags: MessageFlagsBitField.Flags.Ephemeral
            });
        }

        const errorMsg = "При выполнении произошла ошибка. Попробуйте ещё раз."

        const uid = interaction.message.embeds[0].footer?.text;
        if(!uid) return await interaction.reply({
            content: errorMsg,
            flags: MessageFlagsBitField.Flags.Ephemeral
        });

        const hoyo_type = Number(interaction.values[0]) as HoyoType_T;

        if(hoyo_type === HoyoType.ZZZ) {
            return await interaction.reply({
                content: "Эта игра не поддерживается до тех пор, пока Enka полностью ее не выпустит.",
                flags: MessageFlagsBitField.Flags.Ephemeral
            })
        }

        await interaction.deferUpdate();

        const data = await API.uid(Number(interaction.values[0]) as HoyoType_T, uid);
        if(!data) return await interaction.editReply({
            content: "Этот UID не существует или не может быть получен."
        })

        const rows = setDefault(interaction.message.components.slice(0,1), interaction.values[0])

        const selectMenu = selectUidCharacter(data);

        await interaction.editReply({
            files: [],
            embeds: [generateUidBuildEmbed(uid)],
            components: [...rows, new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)]
        })
    }
} satisfies Command;