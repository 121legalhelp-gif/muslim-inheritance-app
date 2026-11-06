const money = value => new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value || 0);

const fractionText = (num, den) => {
  if (!den || den === 0) return '0';
  if (num === 0) return '0';
  if (num % den === 0) return `${num / den}`;
  return `${num}/${den}`;
};

const calculateHeirShare = (baseAmount, num, den) => {
  if (!baseAmount || !den || den === 0) return 0;
  return (baseAmount * num) / den;
};

const resetForm = () => {
  document.getElementById('estate').value = '250000';
  document.getElementById('debts').value = '15000';
  document.getElementById('funeral').value = '5000';
  document.getElementById('bequest').value = '0';
  document.getElementById('spouseType').value = 'wife';
  document.getElementById('father').value = 'yes';
  document.getElementById('mother').value = 'yes';
  document.getElementById('sons').value = '2';
  document.getElementById('daughters').value = '1';
  document.getElementById('fullBrothers').value = '0';
  document.getElementById('fullSisters').value = '0';
  calculate();
};

const getFormData = () => {
  const estate = Number(document.getElementById('estate').value || 0);
  const debts = Number(document.getElementById('debts').value || 0);
  const funeral = Number(document.getElementById('funeral').value || 0);
  const bequest = Number(document.getElementById('bequest').value || 0);

  return {
    estate,
    debts,
    funeral,
    bequest,
    spouseType: document.getElementById('spouseType').value,
    father: document.getElementById('father').value === 'yes',
    mother: document.getElementById('mother').value === 'yes',
    sons: Number(document.getElementById('sons').value || 0),
    daughters: Number(document.getElementById('daughters').value || 0),
    fullBrothers: Number(document.getElementById('fullBrothers').value || 0),
    fullSisters: Number(document.getElementById('fullSisters').value || 0),
  };
};

const calculate = () => {
  const data = getFormData();
  const netEstate = Math.max(0, data.estate - data.debts - data.funeral - data.bequest);

  const hasChildren = data.sons > 0 || data.daughters > 0;
  const hasMultipleSiblings = (data.fullBrothers + data.fullSisters) >= 2;
  const hasSiblings = data.fullBrothers > 0 || data.fullSisters > 0;

  let fixedTotals = [];
  let rows = [];

  // spouse share
  if (data.spouseType === 'husband') {
    const shareFraction = hasChildren ? [1, 4] : [1, 2];
    const amount = calculateHeirShare(netEstate, shareFraction[0], shareFraction[1]);
    rows.push({ name: 'Husband', share: fractionText(shareFraction[0], shareFraction[1]), amount });
    fixedTotals.push(amount);
  }

  if (data.spouseType === 'wife') {
    const shareFraction = hasChildren ? [1, 8] : [1, 4];
    const amount = calculateHeirShare(netEstate, shareFraction[0], shareFraction[1]);
    rows.push({ name: 'Wife', share: fractionText(shareFraction[0], shareFraction[1]), amount });
    fixedTotals.push(amount);
  }

  // mother share
  if (data.mother) {
    const shareFraction = hasChildren || hasMultipleSiblings ? [1, 6] : [1, 3];
    const amount = calculateHeirShare(netEstate, shareFraction[0], shareFraction[1]);
    rows.push({ name: 'Mother', share: fractionText(shareFraction[0], shareFraction[1]), amount });
    fixedTotals.push(amount);
  }

  // father share
  if (data.father) {
    const shareFraction = hasChildren ? [1, 6] : [1, 3];
    const amount = calculateHeirShare(netEstate, shareFraction[0], shareFraction[1]);
    rows.push({ name: 'Father', share: fractionText(shareFraction[0], shareFraction[1]), amount });
    fixedTotals.push(amount);
  }

  // children / residuary calculation
  let remainder = Math.max(0, netEstate - fixedTotals.reduce((sum, value) => sum + value, 0));

  if (hasChildren) {
    const totalChildren = data.sons + data.daughters;

    if (data.sons > 0 && data.daughters > 0) {
      const totalUnits = data.sons * 2 + data.daughters;
      const sonShare = remainder / totalUnits;
      const daughterShare = remainder / totalUnits;

      for (let i = 0; i < data.sons; i += 1) {
        rows.push({ name: 'Son', share: '2:1', amount: sonShare * 2 });
      }

      for (let i = 0; i < data.daughters; i += 1) {
        rows.push({ name: 'Daughter', share: '1', amount: daughterShare });
      }
    } else if (data.sons > 0) {
      const amountPerSon = remainder / data.sons;
      for (let i = 0; i < data.sons; i += 1) {
        rows.push({ name: 'Son', share: '1', amount: amountPerSon });
      }
    } else if (data.daughters > 0) {
      if (data.daughters === 1) {
        rows.push({ name: 'Daughter', share: '1/2', amount: remainder * 0.5 });
      } else {
        const sharePerDaughter = remainder / data.daughters;
        for (let i = 0; i < data.daughters; i += 1) {
          rows.push({ name: 'Daughter', share: '2/3 total', amount: sharePerDaughter });
        }
      }
    }
  }

  // siblings simplified guidance
  if (!hasChildren && hasSiblings && data.spouseType === 'none') {
    const siblingTotal = remainder;
    const totalSiblings = data.fullBrothers + data.fullSisters;
    if (totalSiblings > 0) {
      const totalUnits = data.fullBrothers * 2 + data.fullSisters;
      const sharePerUnit = siblingTotal / totalUnits;

      for (let i = 0; i < data.fullBrothers; i += 1) {
        rows.push({ name: 'Full Brother', share: '2', amount: sharePerUnit * 2 });
      }

      for (let i = 0; i < data.fullSisters; i += 1) {
        rows.push({ name: 'Full Sister', share: '1', amount: sharePerUnit });
      }
    }
  }

  const totalAllocated = rows.reduce((sum, row) => sum + row.amount, 0);
  const amountLeft = Math.max(0, netEstate - totalAllocated);

  document.getElementById('netEstateValue').textContent = money(netEstate);
  document.getElementById('remainingValue').textContent = money(Math.max(0, netEstate - fixedTotals.reduce((sum, value) => sum + value, 0)));

  const resultTable = document.getElementById('resultsTable');

  if (rows.length === 0) {
    resultTable.innerHTML = '<div class="empty-state">No heirs selected. Add at least one heir.</div>';
    return;
  }

  resultTable.innerHTML = rows
    .map(
      row => `
        <div class="result-row">
          <div class="label">${row.name}</div>
          <div class="share">${row.share}</div>
          <div class="amount">${money(row.amount)}</div>
        </div>
      `
    )
    .join('');

  const summaryLine = document.createElement('div');
  summaryLine.className = 'result-row';
  summaryLine.innerHTML = `
    <div class="label">Unallocated / note</div>
    <div class="share">${amountLeft > 0 ? 'Remainder' : 'Balanced'}</div>
    <div class="amount">${money(amountLeft)}</div>
  `;

  resultTable.appendChild(summaryLine);
};

document.getElementById('calculateBtn').addEventListener('click', calculate);
['estate', 'debts', 'funeral', 'bequest', 'spouseType', 'father', 'mother', 'sons', 'daughters', 'fullBrothers', 'fullSisters'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculate);
  document.getElementById(id).addEventListener('change', calculate);
});

document.getElementById('resetBtn').addEventListener('click', resetForm);

calculate();

































































