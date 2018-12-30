// Get ui elems
const form = document.getElementById('vote-form');
const chartContainer = document.getElementById('chartContainer');

// Listen for submit event
form.addEventListener('submit', e => {
  e.preventDefault();

  const choice = document.querySelector('input[name=os]:checked').value;
  const data = { os: choice };
  fetch('http://localhost:8000/poll', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(err => console.error(err));
});

fetch('http://localhost:8000/poll')
  .then(res => res.json())
  .then(({ votes }) => {
    console.log(votes);
    const totalVotes = votes.length;
    // Count vote points
    // const voteCounts = votes.reduce(
    //   (acc, vote) =>
    //     (acc[vote.os] = (acc[vote.os] || 0) + parseInt(vote.points)),
    //   {}
    // );
    const voteCounts = votes.reduce(
      (acc, vote) => (
        (acc[vote.os] = (acc[vote.os] || 0) + parseInt(vote.points)), acc
      ),
      {}
    );
    console.log(voteCounts);
    // Set canvasJs
    let dataPoints = [
      { label: 'Windows', y: voteCounts.Windows },
      { label: 'MacOS', y: voteCounts.MacOS },
      { label: 'Linux', y: voteCounts.Linux },
      { label: 'Other', y: voteCounts.Other }
    ];

    if (chartContainer) {
      const chart = new CanvasJS.Chart(chartContainer, {
        animationEnabled: true,
        theme: 'theme1',
        title: {
          text: `Total votes ${totalVotes}`
        },
        data: [
          {
            type: 'column',
            dataPoints
          }
        ]
      });
      chart.render();

      // Enable pusher logging - don't include this in production
      Pusher.logToConsole = true;

      const pusher = new Pusher('1782e74cb8faaba3558c', {
        cluster: 'ap2',
        forceTLS: true
      });

      const channel = pusher.subscribe('os-poll');
      channel.bind('os-vote', data => {
        dataPoints = dataPoints.map(x => {
          if (x.label === data.os) {
            x.y += data.points;
            return x;
          } else {
            return x;
          }
        });
        chart.render();
      });
    }
  })
  .catch(err => console.error(err));
