const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get_domains")
    .setDescription("Get domains for a specific program.")
    .addStringOption((option) =>
      option
        .setName("program_name")
        .setDescription("The name of the program to get details for.")
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
        (record) =>
          record.programId === programId &&
          record.type.value === "New domains version added"
      );

      if (!matchingActivity) {
        return interaction.reply(
          `Could not find **"${programName}"**. at /programs/activities for some reason.`
        );
      }

      const versionID = matchingActivity.activity.toVersionId;

      const programDomainsResponse = await fetchData(
        `/external/researcher/v1/programs/${programId}/domains/${versionID}`
      );

      const domains = programDomainsResponse.domains.content;
      let replyContent = `Domains for Program ID ${programId} (Version ID: ${versionID}):\n`;

      domains.forEach((domain) => {
        const domainMessage = `Domain ID: ${domain.id}
          Type: ${domain.type.value}
          Endpoint: ${domain.endpoint}
          Tier: ${domain.tier.value}\n\n`;
        replyContent += domainMessage;
      });

      await interaction.reply(replyContent);
    } catch (error) {
      console.error("Error fetching program domains:", error);
      await interaction.reply(
        "An error occurred while fetching program domains."
      );
    }
  },
};
