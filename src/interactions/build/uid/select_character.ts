import {Command} from "../../../types/discord";
import {getBuffer, getFromType, getValues, sameUser, setDefault} from "../../../utils/misc";
import {ActionRowBuilder, AttachmentBuilder, MessageFlagsBitField, StringSelectMenuBuilder} from "discord.js";
import API from "../../../utils/api";
import {HoyoType, HoyoType_T} from "../../../types/models";
import {selectUidCharacter} from "../../../utils/select-menus";
import {EmbedBuilder, generateUidBuildEmbed} from "../../../utils/embeds";

export default {
    role: "SELECT_MENU",
    custom_id: "uid_select_character",
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

        const characterId = interaction.values[0]

        const values = getValues(interaction.message.components.slice(0,1), characterId);

        const hoyo_type = Number(values[0]) as HoyoType_T;

        await interaction.deferUpdate();

        const data = await API.uid(hoyo_type, uid);
        if(!data) return await interaction.editReply({
            content: "Этого UID не существует или не может быть обработан."
        })

        const rows = setDefault(interaction.message.components.slice(0,2), characterId);

        const cardNumber = data.avatars.findIndex((character) => character.id === values[1])+1;

        const url = `https://cards.enka.network/${getFromType(hoyo_type, "u", "hsr", "zzz")}/${uid}/${cardNumber}/image?lang=ru`

        const image = await getBuffer(url);

        const imgName = `${uid}-${characterId}.png`;

        const attachment = new AttachmentBuilder(image, { name: imgName });

        const character = data.getCharacter(characterId);

        if(!character) return await interaction.editReply({
            content: errorMsg
        })

        const embed = new EmbedBuilder()
            .setTitle(`${character.name} первопроходца ${data.nickname}`)
            .setColor(character.colorFromElement)
            .setImage(`attachment://${imgName}`)
            .setFooter({ text: `UID: ${uid}` })

        await interaction.editReply({
            files: [attachment],
            embeds: [embed],
            components: rows
        })
    }
} satisfies Command;