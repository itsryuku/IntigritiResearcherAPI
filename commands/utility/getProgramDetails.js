const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("program_details")
    .setDescription("Returns the details of programs.")
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

      if (targetProgram) {
        const programDetailsResponse = await fetchData(
          `/external/researcher/v1/programs/${targetProgram.id}`
        );

        const programDetail = programDetailsResponse;

        const embed = {
          color: 0x0099ff,
          title: `Details for the program "${programDetail.name}"`,
          fields: [
            { name: "ID", value: programDetail.id },
            { name: "Handle", value: programDetail.handle },
            {
              name: "Confidentiality Level",
              value: programDetail.confidentialityLevel.value,
            },
            { name: "Status", value: programDetail.status.value },
            { name: "Type", value: programDetail.type.value },
            {
              name: "Rules of Engagement",
              value: programDetail.rulesOfEngagement.content.description,
            },
            {
              name: "Domains",
              value: formatDomains(programDetail.domains.content),
            },
            {
              name: "Testing Requirements",
              value: formatTestingRequirements(
                programDetail.rulesOfEngagement.content.testingRequirements
              ),
            },
          ],
          timestamp: new Date(),
          footer: {
            text: "IntigritiHelper",
          },
        };

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply(`Program **"${programName}"** was not found.`);
      }
    } catch (error) {
      console.error(
        "[command program_details] Error fetching program details:",
        error
      );
      await interaction.reply({
        content: "Something went wrong, check console for errors.",
        ephemeral: true,
      });
    }
  },
};

function formatDomains(domains) {
  const domainString = domains
    .map(
      (domain) =>
        `Endpoint: ${domain.endpoint}\nType: ${domain.type.value}\nTier: ${
          domain.tier.value
        }\nDescription: ${domain.description || "N/A"}`
    )
    .join("\n\n");

  return domainString;
}

function formatTestingRequirements(testingRequirements) {
  return `Intigriti.me: ${
    testingRequirements.intigritiMe
  }\nAutomated Tooling: ${testingRequirements.automatedTooling}\nUser Agent: ${
    testingRequirements.userAgent || "N/A"
  }\nRequest Header: ${testingRequirements.requestHeader || "N/A"}`;
}
