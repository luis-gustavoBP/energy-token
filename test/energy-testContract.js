const EnergyCredits = artifacts.require("EnergyCredits");

contract("EnergyCredits", (accounts) => {
    let energyCredits;

    before(async () => {
        // Implantar o contrato antes de cada teste
        energyCredits = await EnergyCredits.new();
    });

    it("deve ser implantado corretamente", async () => {
        const name = await energyCredits.name();
        assert.equal(name, "EnergyCredits", "O nome do token está incorreto");
    });

    it("deve permitir que o proprietário gere energia", async () => {
        const amount = 100; // Quantidade de energia a ser gerada
        await energyCredits.generateEnergy(amount);
        const balance = await energyCredits.balanceOf(accounts[0]);
        assert.equal(balance.toString(), amount.toString(), "O saldo do proprietário deve ser 100");
    });

    it("não deve permitir que não proprietários gerem energia", async () => {
        try {
            await energyCredits.generateEnergy(100, { from: accounts[1] });
            assert.fail("A geração de energia deve falhar para não proprietários");
        } catch (error) {
            assert(error.message.includes("revert"), "O erro não foi revertido");
        }
    });

    it("deve permitir a transferência de créditos de energia", async () => {
        const amount = 50; // Quantidade a ser transferida
        await energyCredits.transferCredits(accounts[1], amount, { from: accounts[0] });
        const balanceSender = await energyCredits.balanceOf(accounts[0]);
        const balanceReceiver = await energyCredits.balanceOf(accounts[1]);
        assert.equal(balanceSender.toString(), "50", "O saldo do remetente deve ser 50");
        assert.equal(balanceReceiver.toString(), "50", "O saldo do destinatário deve ser 50");
    });
});
