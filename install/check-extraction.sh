#!/usr/bin/env bash
# Proves that cutting the generic part out of an area reference lost nothing (D58).
# The area reference at <base> is the original. Every rule it carried has to be found
# again in the area reference as it is now or in one of the generic references it was
# extracted to. A rule is:
#   - a bold span (**...**), the way these references state what is not negotiable;
#   - a closing-checklist item (- [ ] ...), joined across its wrapped lines;
#   - a non-blank line inside a code fence, because code that left the area reference
#     has to land somewhere too.
# Text is compared normalised: no backticks or asterisks, lowercase, whitespace collapsed
# and trailing punctuation dropped, so rewrapping a paragraph is not a loss.
# A rule rewritten in other words will not be found verbatim. It is reviewed by hand and
# written in the reviewed file, one per line as "<rule as printed> => <where it went>";
# a reviewed rule stops failing. The reviewed file is
#   Plan/mejoras/extraccion/<area path under skills/nzt, slashes as dashes>.reviewed
# Usage: install/check-extraction.sh [--base <ref>] <area-ref> <generic-ref>...
#        (default base: main; paths relative to the repository root)
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

base=main
if [ "${1:-}" = "--base" ]; then
  base="$2"
  shift 2
fi

if [ "$#" -lt 1 ]; then
  echo "usage: install/check-extraction.sh [--base <ref>] <area-ref> <generic-ref>..." >&2
  exit 2
fi

area="$1"
shift

for file in "$area" "$@"; do
  if [ ! -f "$file" ]; then
    echo "not found: $file" >&2
    exit 2
  fi
done

original="$(mktemp)"
trap 'rm -f "$original"' EXIT
if ! git show "$base:$area" > "$original" 2>/dev/null; then
  echo "not at $base: $area" >&2
  exit 2
fi

reviewed="Plan/mejoras/extraccion/$(echo "${area#skills/nzt/}" | tr '/' '-').reviewed"

perl - "$original" "$reviewed" "$area" "$@" <<'PERL'
use strict;
use warnings;

my ($original, $reviewed, @current) = @ARGV;

sub slurp {
    my ($path) = @_;
    open(my $fh, '<:encoding(UTF-8)', $path) or die "cannot read $path\n";
    local $/;
    my $text = <$fh>;
    close($fh);
    $text =~ s/\r//g;
    return $text;
}

sub normalise {
    my ($text) = @_;
    $text =~ s/[`*]//g;
    $text = lc($text);
    $text =~ s/\s+/ /g;
    $text =~ s/^\s+|\s+$//g;
    $text =~ s/[.:;,]+$//;
    return $text;
}

my $source = slurp($original);
my @rules;

# Code lines first, then the fences are taken out so their text is not read as prose.
while ($source =~ /^```[^\n]*\n(.*?)^```/msg) {
    for my $line (split /\n/, $1) {
        push @rules, ['code', $line] if $line =~ /\S/;
    }
}
(my $prose = $source) =~ s/^```.*?^```//msg;

my $current_item;
for my $line (split /\n/, $prose) {
    if ($line =~ /^\s*- \[ \] (.*)$/) {
        push @rules, ['checklist', $current_item] if defined $current_item;
        $current_item = $1;
    } elsif (defined $current_item && $line =~ /^\s+\S/) {
        $current_item .= ' ' . $line;
    } else {
        push @rules, ['checklist', $current_item] if defined $current_item;
        undef $current_item;
    }
}
push @rules, ['checklist', $current_item] if defined $current_item;

(my $joined = $prose) =~ s/\s+/ /g;
while ($joined =~ /\*\*(.+?)\*\*/g) {
    push @rules, ['bold', $1];
}

my $haystack = normalise(join("\n", map { slurp($_) } @current));

my %accepted;
if (-f $reviewed) {
    for my $line (split /\n/, slurp($reviewed)) {
        next if $line =~ /^\s*(#|$)/;
        my ($rule) = split / => /, $line, 2;
        $accepted{normalise($rule)} = 1;
    }
}

my (%seen, $total, $found, $by_review, @missing);
for my $rule (@rules) {
    my ($kind, $text) = @$rule;
    my $key = normalise($text);
    next if $key eq '' || $seen{"$kind\t$key"}++;
    $total++;
    if (index($haystack, $key) >= 0) {
        $found++;
    } elsif ($accepted{$key}) {
        $by_review++;
    } else {
        push @missing, "$kind\t$key";
    }
}

binmode(STDOUT, ':encoding(UTF-8)');
printf "%d rules at the original: %d found, %d reviewed by hand, %d missing\n",
    $total, $found // 0, $by_review // 0, scalar @missing;
for my $miss (@missing) {
    my ($kind, $key) = split /\t/, $miss, 2;
    print "MISSING  $kind  $key\n";
}
if (@missing) {
    print "Each one is restored, or reviewed and written in $reviewed\n";
    exit 1;
}
print "OK\n";
PERL
