const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get_rules")
    .setDescription("Get rules of engagement for a specific program.")
    .addStringOption((option) =>
      option
        .setName("program_name")
        .setDescription("Name of the program.")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const programName = interaction.options.getString("program_name");
      const allProgramsResponse = await fetchData(
        "/external/researcher/v1/programs"
      );

      const targetProgram = allProgramsResponse.records.find(
        (program) => program.name.toLowerCase() === programName.toLowerCase()
      );

      if (!targetProgram) {
        return interaction.reply(`No program **"${programName}"**.`);
      }

      const programId = targetProgram.id;

      const programsActivitiesResponse = await fetchData(
        "/external/researcher/v1/programs/activities"
      );

      const matchingActivity = programsActivitiesResponse.records.find(
        (record) => record.programId === programId
      );

      if (!matchingActivity) {
        return interaction.reply(
          `Could not find **"${programName}"**. at /programs/activities for some reason.`
        );
      }

      const versionID = matchingActivity.activity.toVersionId;
      const programRulesResponse = await fetchData(
        `/external/researcher/v1/programs/${programId}/rules-of-engagements/${versionID}`
      );

      const rulesContent = programRulesResponse.rulesOfEngagement.content;
      const embed = {
        color: 0x0099ff,
        title: `Rules of Engagement for Program ID ${programId} (Version ID: ${versionID})`,
        fields: [
          {
            name: "Description",
            value: rulesContent.description,
          },
          {
            name: "Testing Requirements",
            value: `Intigriti Me: ${rulesContent.testingRequirements.intigritiMe}\n
            Automated Tooling: ${rulesContent.testingRequirements.automatedTooling}\n
            Request Header: ${rulesContent.testingRequirements.requestHeader}`,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "Intigriti Bot",
        },
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching program rules:", error);
      await interaction.reply({
        content: "An error occurred while fetching program rules.",
        ephemeral: true,
      });
    }
  },
};
