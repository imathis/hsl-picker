desc "Deploy via Rsync"
task :deploy do
  cp_r 'javascripts/.', '_site/javascripts'
  cp_r 'fonts/.',       '_site/fonts'
  cp_r 'stylesheets/.', '_site/stylesheets'
  cp_r 'index.html',    '_site/index.html'
  puts "## Deploying website via Rsync"
  system("rsync -avze ssh _site/ imathis@hslpicker.com:~/hslpicker.com/")
end

